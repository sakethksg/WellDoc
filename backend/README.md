# Backend API - Risk Prediction Service

## Directory Structure

```
backend/
├── main.py                    # FastAPI main application
├── feature_engineering.py    # Patient feature extraction
├── prediction_service.py     # ML prediction logic
├── models.py                 # Pydantic data models
├── config.py                 # Configuration settings
├── examples.py              # API usage examples
├── run_api.py               # API server launcher
├── test_api.py              # API testing script
├── models/                  # Trained ML models (created after training)
└── __init__.py              # Package initialization

```

## Usage

1. **Train Models**: Run the ML pipeline in `../ml_pipeline/`
2. **Start API**: `python run_api.py`
3. **Test API**: `python test_api.py`

## API Endpoints

- `POST /predict/risk` - Predict patient risk level
- `GET /health` - Health check
- `GET /examples` - API usage examples
