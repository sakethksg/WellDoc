
"""
Production-Ready Risk Prediction Function
Generated: 2025-09-09T11:08:05.775577
Model: XGBoost
"""

import joblib
import json
import pandas as pd
import numpy as np

# Load production artifacts
model = joblib.load('production_models/final_model_xgboost.pkl')
scaler = joblib.load('production_models/feature_scaler.pkl')
label_encoder = joblib.load('production_models/label_encoder.pkl')

with open('production_models/feature_metadata.json', 'r') as f:
    feature_metadata = json.load(f)

def predict_patient_risk(patient_data):
    """
    Predict 90-day deterioration risk for a patient

    Args:
        patient_data (dict): Patient features as key-value pairs

    Returns:
        dict: Risk prediction with probability, level, and recommendations
    """
    # Convert to DataFrame and ensure correct feature order
    df = pd.DataFrame([patient_data])
    feature_cols = feature_metadata['feature_names']

    # Ensure all features are present
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0  # Default value for missing features

    X = df[feature_cols].values

    # Apply scaling if needed
    X_scaled = X

    # Predict
    probabilities = model.predict_proba(X_scaled)[0]
    risk_probability = probabilities[2]  # High risk probability

    # Determine risk level
    if risk_probability >= 0.7:
        risk_level = "HIGH"
        urgency = "IMMEDIATE"
    elif risk_probability >= 0.3:
        risk_level = "MEDIUM"
        urgency = "WITHIN 2 WEEKS"
    else:
        risk_level = "LOW"
        urgency = "ROUTINE MONITORING"

    return {
        'risk_probability': float(risk_probability),
        'risk_level': risk_level,
        'urgency': urgency,
        'model_name': 'XGBoost',
        'prediction_date': pd.Timestamp.now().isoformat()
    }

# Example usage:
# patient = {'age': 65, 'bmi': 32, 'has_diabetes': 1, 'systolic_bp': 150, ...}
# result = predict_patient_risk(patient)
# print(f"Risk Level: {result['risk_level']} ({result['risk_probability']:.1%})")
