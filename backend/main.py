from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime
import uvicorn
import logging

# Import our risk predictor
from models.risk_predictor import get_risk_predictor, RiskPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WellDoc AI Risk Prediction API", 
    version="2.0.0",
    description="AI-driven 90-day deterioration risk prediction for chronic care patients"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced Pydantic models for request/response
class PatientData(BaseModel):
    """Patient data for risk prediction (30-180 days of data)"""
    patient_id: Optional[str] = Field(default="unknown", description="Unique patient identifier")
    
    # Demographics
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    gender_male: int = Field(default=0, ge=0, le=1, description="1 if male, 0 if female")
    
    # Race/Ethnicity (optional, default to 0)
    race_white: Optional[int] = Field(default=0, ge=0, le=1)
    race_black: Optional[int] = Field(default=0, ge=0, le=1)
    race_asian: Optional[int] = Field(default=0, ge=0, le=1)
    race_hispanic: Optional[int] = Field(default=0, ge=0, le=1)
    
    # Chronic Conditions
    has_diabetes: int = Field(default=0, ge=0, le=1, description="1 if has diabetes")
    has_hypertension: int = Field(default=0, ge=0, le=1, description="1 if has hypertension")
    has_heart_disease: int = Field(default=0, ge=0, le=1, description="1 if has heart disease")
    has_kidney_disease: int = Field(default=0, ge=0, le=1, description="1 if has kidney disease")
    has_stroke: int = Field(default=0, ge=0, le=1, description="1 if has stroke history")
    has_copd: int = Field(default=0, ge=0, le=1, description="1 if has COPD")
    has_depression: int = Field(default=0, ge=0, le=1, description="1 if has depression")
    has_cancer: int = Field(default=0, ge=0, le=1, description="1 if has cancer")
    
    # Condition counts
    total_conditions: Optional[int] = Field(default=0, ge=0, description="Total number of conditions")
    comorbidity_count: Optional[int] = Field(default=0, ge=0, description="Number of comorbidities")
    
    # Vital Signs & Lab Results
    bmi: float = Field(..., gt=10, lt=70, description="Body Mass Index")
    systolic_bp: float = Field(..., gt=60, lt=250, description="Systolic blood pressure mmHg")
    diastolic_bp: float = Field(..., gt=40, lt=150, description="Diastolic blood pressure mmHg")
    heart_rate: Optional[float] = Field(default=70.0, gt=30, lt=200, description="Heart rate bpm")
    glucose: Optional[float] = Field(default=100.0, gt=50, lt=500, description="Blood glucose mg/dL")
    hba1c: Optional[float] = Field(default=6.0, gt=4, lt=15, description="HbA1c percentage")
    cholesterol: Optional[float] = Field(default=200.0, gt=100, lt=400, description="Total cholesterol mg/dL")
    
    # Data availability flags
    has_bmi_data: Optional[int] = Field(default=1, ge=0, le=1)
    has_bp_data: Optional[int] = Field(default=1, ge=0, le=1)
    has_glucose_data: Optional[int] = Field(default=0, ge=0, le=1)
    has_hba1c_data: Optional[int] = Field(default=0, ge=0, le=1)
    
    # Healthcare Utilization (last 30-180 days)
    total_encounters: Optional[int] = Field(default=0, ge=0, description="Total healthcare encounters")
    inpatient_visits: Optional[int] = Field(default=0, ge=0, description="Inpatient visits")
    emergency_visits: Optional[int] = Field(default=0, ge=0, description="Emergency department visits")
    outpatient_visits: Optional[int] = Field(default=0, ge=0, description="Outpatient visits")
    has_inpatient: Optional[int] = Field(default=0, ge=0, le=1)
    has_emergency: Optional[int] = Field(default=0, ge=0, le=1)
    
    # Medications
    medication_count: Optional[int] = Field(default=0, ge=0, description="Number of medications")
    polypharmacy: Optional[int] = Field(default=0, ge=0, le=1, description="1 if >5 medications")

class Recommendation(BaseModel):
    """Clinical recommendation"""
    category: str
    recommendation: str
    priority: str
    rationale: str

class RiskAssessment(BaseModel):
    """Risk assessment details"""
    deterioration_probability: float = Field(..., ge=0, le=1, description="90-day deterioration probability")
    risk_level: str = Field(..., description="Risk level: low, medium, high")
    priority: str = Field(..., description="Priority: LOW, MEDIUM, HIGH")
    urgency: str = Field(..., description="Urgency: ROUTINE MONITORING, WITHIN 2 WEEKS, IMMEDIATE")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")

class ClassProbabilities(BaseModel):
    """Individual class probabilities"""
    high_risk: float
    medium_risk: float
    low_risk: float

class ModelInfo(BaseModel):
    """Model information"""
    model_name: str
    model_version: str
    performance: Dict[str, float]

class RiskPrediction(BaseModel):
    """Complete risk prediction response"""
    patient_id: str
    risk_assessment: RiskAssessment
    class_probabilities: ClassProbabilities
    recommendations: List[Recommendation]
    model_info: ModelInfo
    prediction_timestamp: str

class HealthStatus(BaseModel):
    """API health status"""
    status: str
    model_loaded: bool
    model_name: str
    model_version: str
    features_count: int
    timestamp: str

# Simplified patient data for testing
@app.on_event("startup")
async def startup_event():
    """Initialize the risk predictor on startup"""
    try:
        predictor = get_risk_predictor()
        logger.info("✅ Risk predictor initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize risk predictor: {e}")
        raise

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "WellDoc AI Risk Prediction API",
        "version": "2.0.0",
        "description": "AI-driven 90-day deterioration risk prediction for chronic care patients",
        "status": "running",
        "endpoints": {
            "/health": "Health check",
            "/predict": "Risk prediction (comprehensive patient data)",
            "/model/info": "Model information",
            "/model/features": "Required features information",
            "/docs": "API documentation"
        }
    }

@app.get("/health", response_model=HealthStatus)
async def health_check(predictor: RiskPredictor = Depends(get_risk_predictor)):
    """Comprehensive health check including model status"""
    try:
        health_status = predictor.health_check()
        return HealthStatus(**health_status)
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.post("/predict", response_model=RiskPrediction)
async def predict_risk(
    patient_data: PatientData, 
    predictor: RiskPredictor = Depends(get_risk_predictor)
):
    """
    Predict 90-day deterioration risk for a chronic care patient
    
    This endpoint accepts comprehensive patient data (30-180 days) and returns:
    - Deterioration probability
    - Risk level and urgency
    - Clinical recommendations
    - Model explanations
    """
    try:
        logger.info(f"Processing risk prediction for patient: {patient_data.patient_id}")
        
        # Convert Pydantic model to dict
        patient_dict = patient_data.dict()
        
        # Get prediction
        prediction = predictor.predict_risk(patient_dict)
        
        # Convert to response model
        response = RiskPrediction(
            patient_id=prediction['patient_id'],
            risk_assessment=RiskAssessment(**prediction['risk_assessment']),
            class_probabilities=ClassProbabilities(**prediction['class_probabilities']),
            recommendations=[Recommendation(**rec) for rec in prediction['recommendations']],
            model_info=ModelInfo(**prediction['model_info']),
            prediction_timestamp=prediction['prediction_timestamp']
        )
        
        logger.info(f"✅ Prediction completed: {response.risk_assessment.risk_level} risk")
        return response
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/model/info")
async def get_model_info(predictor: RiskPredictor = Depends(get_risk_predictor)):
    """Get detailed model information including feature importance"""
    try:
        return predictor.get_feature_importance()
    except Exception as e:
        logger.error(f"Model info error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve model information")

@app.get("/model/features")
async def get_required_features(predictor: RiskPredictor = Depends(get_risk_predictor)):
    """Get list of required features for prediction"""
    try:
        feature_info = predictor.get_feature_importance()
        feature_names = predictor.feature_metadata.get('feature_names', []) if predictor.feature_metadata else []
        return {
            "required_features": feature_names,
            "clinical_mapping": feature_info['clinical_mapping'],
            "total_features": len(feature_names)
        }
    except Exception as e:
        logger.error(f"Features info error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve feature information")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
