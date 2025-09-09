# ML Pipeline - Risk Prediction

## Directory Structure

```
ml_pipeline/
├── step1_data_extraction.ipynb    # Extract clean dataset from Synthea
├── step2_model_training.ipynb     # Train ML models on clean data
├── primary_dataset.csv            # Clean patient dataset (output of step1)
└── README.md                      # This file
```

## Workflow

### Step 1: Data Extraction
- **Input**: Raw Synthea CSV files in `../data/output/csv/`
- **Process**: Extract patient features, create risk scores
- **Output**: `primary_dataset.csv` (910 patients, 35+ features)

### Step 2: Model Training  
- **Input**: `primary_dataset.csv`
- **Process**: Train ML models with proper validation
- **Output**: Trained models saved to `../backend/models/`

## Expected Results
- **Accuracy**: 60-75% (realistic for medical prediction)
- **No Data Leakage**: Clean separation between steps
- **Production Ready**: Models ready for API deployment

## Usage
1. Run Step 1 notebook to create clean dataset
2. Run Step 2 notebook to train models
3. Models are automatically saved for backend API use
