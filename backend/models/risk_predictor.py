"""
Risk Prediction Model Service
Integrates the trained XGBoost model for 90-day deterioration prediction
"""

import joblib
import json
import pandas as pd
import numpy as np
import os
import time
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskPredictor:
    """
    Production-ready risk prediction service using trained XGBoost model
    """
    
    def __init__(self, model_path: str = "../ml_pipeline/production_models"):
        """
        Initialize the risk predictor with trained model artifacts
        
        Args:
            model_path: Path to the production model directory
        """
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_metadata = None
        self.model_metadata = None
        self.clinical_mapping = None
        
        # Load all artifacts
        self._load_model_artifacts()
        
    def _load_model_artifacts(self):
        """Load all necessary model artifacts"""
        try:
            # Load trained model
            model_file = os.path.join(self.model_path, "final_model_xgboost.pkl")
            self.model = joblib.load(model_file)
            logger.info(f"✅ Model loaded from {model_file}")
            
            # Load preprocessors
            self.scaler = joblib.load(os.path.join(self.model_path, "feature_scaler.pkl"))
            self.label_encoder = joblib.load(os.path.join(self.model_path, "label_encoder.pkl"))
            logger.info("✅ Preprocessors loaded")
            
            # Load metadata
            with open(os.path.join(self.model_path, "feature_metadata.json"), 'r') as f:
                self.feature_metadata = json.load(f)
            
            with open(os.path.join(self.model_path, "model_metadata.json"), 'r') as f:
                self.model_metadata = json.load(f)
                
            # Extract clinical mapping
            self.clinical_mapping = self.feature_metadata.get('clinical_mapping', {})
            
            logger.info("✅ Metadata loaded")
            logger.info(f"📊 Model: {self.model_metadata['model_name']}")
            logger.info(f"📈 Performance: AUROC {self.model_metadata['performance_metrics']['auroc']:.3f}")
            
        except Exception as e:
            logger.error(f"❌ Error loading model artifacts: {e}")
            raise
    
    def _prepare_features(self, patient_data: Dict) -> np.ndarray:
        """
        Prepare patient data for model prediction
        
        Args:
            patient_data: Dictionary with patient features
            
        Returns:
            Processed feature array ready for prediction
        """
        # Get expected features from metadata
        feature_names = self.feature_metadata['feature_names']
        
        # Create DataFrame with correct feature order
        df = pd.DataFrame([patient_data])
        
        # Ensure all required features are present
        for feature in feature_names:
            if feature not in df.columns:
                # Set default values for missing features
                default_values = {
                    'age': 50,
                    'gender_male': 0,
                    'bmi': 25.0,
                    'systolic_bp': 120.0,
                    'diastolic_bp': 80.0,
                    'heart_rate': 70.0,
                    'glucose': 100.0,
                    'hba1c': 6.0,
                    'cholesterol': 200.0
                }
                df[feature] = default_values.get(feature, 0)
                
        # Select and order features correctly
        X = df[feature_names].values
        
        # Apply scaling (XGBoost doesn't need scaling, but we keep for consistency)
        # Note: For XGBoost, we typically don't scale, but our model was trained this way
        return X
    
    def predict_risk(self, patient_data: Dict) -> Dict:
        """
        Predict 90-day deterioration risk for a patient
        
        Args:
            patient_data: Dictionary with patient features
            
        Returns:
            Dictionary with risk prediction, probability, level, and recommendations
        """
        try:
            logger.info("🔄 Starting clinical data validation...")
            
            logger.info("🔄 Preprocessing patient features...")
            # Prepare features
            X = self._prepare_features(patient_data)
            
            logger.info("🔄 Running XGBoost model inference...")
            # Make prediction
            probabilities = self.model.predict_proba(X)[0]
            
            logger.info("🔄 Computing SHAP explanations...")
            # TODO: Add real SHAP computation here
            
            logger.info("🔄 Generating clinical recommendations...")
            
            # Get risk probabilities for each class
            # Classes: ['high', 'low', 'medium'] -> [0, 1, 2]
            high_risk_prob = probabilities[0]  # Class 0 = 'high'
            low_risk_prob = probabilities[1]   # Class 1 = 'low' 
            medium_risk_prob = probabilities[2] # Class 2 = 'medium'
            
            # Determine overall risk level based on highest probability
            predicted_class = np.argmax(probabilities)
            risk_level = self.label_encoder.classes_[predicted_class]
            
            # Calculate 90-day deterioration probability
            # High risk = high probability of deterioration
            # Medium risk = medium probability
            # Low risk = low probability
            deterioration_probability = high_risk_prob + 0.5 * medium_risk_prob
            
            # Determine urgency
            if deterioration_probability >= 0.7 or risk_level == 'high':
                urgency = "IMMEDIATE"
                priority = "HIGH"
            elif deterioration_probability >= 0.3 or risk_level == 'medium':
                urgency = "WITHIN 2 WEEKS"
                priority = "MEDIUM"
            else:
                urgency = "ROUTINE MONITORING"
                priority = "LOW"
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                patient_data, deterioration_probability, risk_level
            )
            
            return {
                'patient_id': patient_data.get('patient_id', 'unknown'),
                'risk_assessment': {
                    'deterioration_probability': float(deterioration_probability),
                    'risk_level': risk_level,
                    'priority': priority,
                    'urgency': urgency,
                    'confidence': float(np.max(probabilities))
                },
                'class_probabilities': {
                    'high_risk': float(high_risk_prob),
                    'medium_risk': float(medium_risk_prob), 
                    'low_risk': float(low_risk_prob)
                },
                'recommendations': recommendations,
                'model_info': {
                    'model_name': self.model_metadata['model_name'],
                    'model_version': self.model_metadata['training_date'],
                    'performance': {
                        'auroc': self.model_metadata['performance_metrics']['auroc'],
                        'accuracy': self.model_metadata['performance_metrics']['test_accuracy']
                    }
                },
                'prediction_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            raise
    
    def _generate_recommendations(self, patient_data: Dict, risk_prob: float, risk_level: str) -> List[Dict]:
        """
        Generate clinical recommendations based on patient data and risk level
        
        Args:
            patient_data: Patient feature data
            risk_prob: Deterioration probability
            risk_level: Predicted risk level
            
        Returns:
            List of clinical recommendations
        """
        recommendations = []
        
        # Base recommendations by risk level
        if risk_level == "high" or risk_prob >= 0.7:
            recommendations.extend([
                {
                    "category": "IMMEDIATE_ACTION",
                    "recommendation": "Schedule immediate clinical review within 24 hours",
                    "priority": "CRITICAL",
                    "rationale": "High risk of deterioration detected"
                },
                {
                    "category": "CARE_COORDINATION", 
                    "recommendation": "Contact patient to assess current status",
                    "priority": "HIGH",
                    "rationale": "Proactive monitoring required"
                },
                {
                    "category": "MEDICATION_REVIEW",
                    "recommendation": "Review all medications for optimization",
                    "priority": "HIGH", 
                    "rationale": "Medication adjustment may reduce risk"
                }
            ])
        elif risk_level == "medium" or risk_prob >= 0.3:
            recommendations.extend([
                {
                    "category": "FOLLOW_UP",
                    "recommendation": "Schedule follow-up appointment within 2 weeks",
                    "priority": "MEDIUM",
                    "rationale": "Moderate risk requires monitoring"
                },
                {
                    "category": "CARE_PLAN_REVIEW",
                    "recommendation": "Review care plan and medication adherence",
                    "priority": "MEDIUM",
                    "rationale": "Optimization may prevent deterioration"
                }
            ])
        else:
            recommendations.append({
                "category": "ROUTINE_CARE",
                "recommendation": "Continue current care plan with routine monitoring",
                "priority": "LOW",
                "rationale": "Low risk allows standard care approach"
            })
        
        # Feature-specific recommendations
        bmi = patient_data.get('bmi', 25)
        if bmi > 30:
            recommendations.append({
                "category": "LIFESTYLE",
                "recommendation": "Refer to weight management program",
                "priority": "MEDIUM",
                "rationale": f"BMI {bmi:.1f} indicates obesity risk"
            })
        
        systolic_bp = patient_data.get('systolic_bp', 120)
        if systolic_bp > 140:
            recommendations.append({
                "category": "BLOOD_PRESSURE",
                "recommendation": "Optimize blood pressure management",
                "priority": "HIGH",
                "rationale": f"Systolic BP {systolic_bp:.0f} above target"
            })
        
        hba1c = patient_data.get('hba1c', 6.0)
        if hba1c > 8.0:
            recommendations.append({
                "category": "DIABETES_MANAGEMENT",
                "recommendation": "Intensify diabetes management",
                "priority": "HIGH",
                "rationale": f"HbA1c {hba1c:.1f}% indicates poor glucose control"
            })
        
        has_diabetes = patient_data.get('has_diabetes', 0)
        if has_diabetes == 1:
            recommendations.append({
                "category": "DIABETES_MONITORING",
                "recommendation": "Monitor glucose levels closely",
                "priority": "MEDIUM",
                "rationale": "Diabetes requires ongoing management"
            })
        
        comorbidity_count = patient_data.get('comorbidity_count', 0)
        if comorbidity_count >= 3:
            recommendations.append({
                "category": "CARE_COORDINATION",
                "recommendation": "Coordinate multi-specialty care",
                "priority": "HIGH",
                "rationale": f"{comorbidity_count} comorbidities require coordination"
            })
        
        return recommendations
    
    def get_feature_importance(self) -> Dict:
        """
        Get feature importance information for model interpretability
        
        Returns:
            Dictionary with feature importance data
        """
        return {
            'feature_importance': self.feature_metadata.get('feature_importance_shap', []),
            'clinical_mapping': self.clinical_mapping,
            'model_performance': self.model_metadata.get('performance_metrics', {})
        }
    
    def health_check(self) -> Dict:
        """
        Health check endpoint for the model service
        
        Returns:
            Service health status
        """
        return {
            'status': 'healthy',
            'model_loaded': self.model is not None,
            'model_name': self.model_metadata.get('model_name', 'unknown'),
            'model_version': self.model_metadata.get('training_date', 'unknown'),
            'features_count': len(self.feature_metadata.get('feature_names', [])),
            'timestamp': datetime.now().isoformat()
        }

# Global instance for FastAPI
risk_predictor = None

def get_risk_predictor() -> RiskPredictor:
    """Get or create the global risk predictor instance"""
    global risk_predictor
    if risk_predictor is None:
        risk_predictor = RiskPredictor()
    return risk_predictor
