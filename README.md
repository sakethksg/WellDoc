# WellDoc - AI Risk Prediction Engine

A professional healthcare dashboard prototype for predicting chronic care patient deterioration risk using AI.

## 🏥 Overview

WellDoc is an AI-driven Risk Prediction Engine that forecasts whether a chronic care patient is at risk of deterioration in the next 90 days. The dashboard provides clinician-friendly, explainable predictions with actionable insights.

## ✨ Features

### 🎯 Core Functionality
- **Risk Prediction**: Binary classification with probability scores (0-100%)
- **Dashboard Scores**: Individual assessments for Vitals, Medication, Lifestyle, and Labs
- **Explainable AI**: SHAP-based feature importance and risk factor analysis
- **Real-time Monitoring**: Patient cohort overview with trend analysis

### 📊 Dashboard Views
1. **Overview Dashboard**: Key metrics, risk distribution, and recent alerts
2. **Cohort View**: Complete patient list with filtering and sorting
3. **Patient Detail**: Individual patient deep-dive with charts and recommendations
4. **Analytics**: Model performance metrics and clinical outcomes

### 🎨 Design Features
- **Dark Theme**: Professional healthcare-focused design
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive**: Works on desktop and tablet devices
- **Professional**: Clean, medical-grade interface without emojis

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Data**: Synthetic demo data with realistic medical scenarios

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install**
   ```bash
   cd welldoc
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Demo Navigation

### Dashboard Overview (`/`)
- Key metrics: Total patients, high-risk count, average risk score
- Risk distribution chart
- Recent alerts and high-risk patients
- Quick action buttons

### Cohort View (`/cohort`)
- Complete patient list with search and filtering
- Risk level distribution summary
- Sort by name, risk score, or last updated
- Direct links to patient details

### Patient Details (`/patients/[id]`)
- Overall risk score with trend indicators
- Dashboard scores breakdown (Vitals, Medication, Lifestyle, Labs)
- Interactive charts: Vital signs, lab results, medication adherence
- Risk factors analysis with impact percentages
- Clinical recommendations

### Analytics (`/analytics`)
- Model performance metrics (AUROC, AUPRC, Precision, Recall)
- Feature importance analysis
- Prediction accuracy trends
- Intervention outcomes and patient timeline
- Clinical impact summary

## 🧪 Demo Data

The application includes 5 synthetic patients with different risk profiles:

1. **John Mitchell** (High Risk - 85%): Declining vitals, poor medication adherence
2. **Sarah Chen** (Low Risk - 15%): Well-controlled pre-diabetes, good lifestyle
3. **Robert Williams** (Medium Risk - 55%): Heart failure with mixed indicators
4. **Maria Rodriguez** (High Risk - 78%): Diabetes with kidney complications
5. **David Thompson** (Medium Risk - 42%): Metabolic syndrome, improving trends

## 🏗 Architecture

### Data Flow
```
Synthetic Patient Data → Feature Engineering → Binary Classification Model
                                           ↓
Risk Probability → Dashboard Scores → SHAP Analysis → Clinical Insights
```

### Score Derivation
- **Risk Score**: Direct model probability (0-100%)
- **Category Scores**: Aggregated SHAP values for feature groups
- **Trends**: Time-series analysis (improving/stable/declining)
- **Recommendations**: Rule-based clinical guidelines

## 📈 Model Concept

While this is a frontend prototype with synthetic data, the underlying ML approach:

- **Model**: XGBoost/LightGBM for binary classification
- **Features**: Vitals trends, medication adherence, lab results, lifestyle factors
- **Target**: 90-day deterioration risk (binary)
- **Explainability**: SHAP values for global and local explanations
- **Metrics**: AUROC >0.80, AUPRC >0.70, calibrated probabilities

## 🎯 Prototype Goals

This 1-day prototype demonstrates:
- ✅ End-to-end dashboard for risk prediction
- ✅ Professional healthcare UI/UX
- ✅ Multiple visualization types
- ✅ Clinician-friendly explanations
- ✅ Scalable component architecture
- ✅ Realistic medical scenarios

## 🔮 Future Enhancements

- **Real ML Pipeline**: Integrate actual model training and inference
- **Live Data**: Connect to EMR systems and real patient data
- **Advanced Charts**: Time-series forecasting and trend prediction
- **Mobile App**: React Native companion for on-the-go monitoring
- **Alerts System**: Real-time notifications and escalation workflows

## 📄 License

This is a prototype developed for demonstration purposes.

---

**Built with ❤️ for better patient outcomes**
