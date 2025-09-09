export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  condition: string;
  riskScore: number;
  lastUpdated: string;
  status: 'high' | 'medium' | 'low';
  dashboardScores: {
    vitals: number;
    medication: number;
    lifestyle: number;
    labs: number;
  };
  trends: {
    vitals: 'improving' | 'stable' | 'declining';
    medication: 'improving' | 'stable' | 'declining';
    lifestyle: 'improving' | 'stable' | 'declining';
    labs: 'improving' | 'stable' | 'declining';
  };
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface VitalReading {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  glucose: number;
  weight: number;
}

export interface LabResult {
  date: string;
  hba1c: number;
  cholesterol: number;
  hdl: number;
  ldl: number;
  creatinine: number;
}

export interface MedicationAdherence {
  date: string;
  adherenceRate: number;
  missedDoses: number;
}

export const demoPatients: Patient[] = [
  {
    id: "P001",
    name: "John Mitchell",
    age: 67,
    gender: "M",
    condition: "Type 2 Diabetes, Hypertension",
    riskScore: 85,
    lastUpdated: "2024-09-08T10:30:00Z",
    status: "high",
    dashboardScores: {
      vitals: 25,
      medication: 40,
      lifestyle: 35,
      labs: 30
    },
    trends: {
      vitals: "declining",
      medication: "declining",
      lifestyle: "stable",
      labs: "declining"
    },
    riskFactors: [
      {
        factor: "Blood Pressure Control",
        impact: 32,
        description: "Systolic BP averaging 165 mmHg over past 30 days"
      },
      {
        factor: "Medication Adherence",
        impact: 28,
        description: "Missing 40% of prescribed doses"
      },
      {
        factor: "Glucose Variability",
        impact: 25,
        description: "High glucose fluctuations indicating poor control"
      }
    ],
    recommendations: [
      "Schedule medication review appointment",
      "Implement blood pressure monitoring protocol",
      "Consider diabetes education program",
      "Evaluate current medication regimen effectiveness"
    ]
  },
  {
    id: "P002",
    name: "Sarah Chen",
    age: 54,
    gender: "F",
    condition: "Pre-diabetes, Obesity",
    riskScore: 15,
    lastUpdated: "2024-09-08T09:15:00Z",
    status: "low",
    dashboardScores: {
      vitals: 85,
      medication: 95,
      lifestyle: 80,
      labs: 75
    },
    trends: {
      vitals: "improving",
      medication: "stable",
      lifestyle: "improving",
      labs: "improving"
    },
    riskFactors: [
      {
        factor: "BMI",
        impact: 15,
        description: "BMI slightly elevated at 28.5"
      },
      {
        factor: "Family History",
        impact: 10,
        description: "Strong family history of diabetes"
      }
    ],
    recommendations: [
      "Continue current lifestyle modifications",
      "Regular monitoring of glucose levels",
      "Maintain exercise routine",
      "Consider nutritionist consultation"
    ]
  },
  {
    id: "P003",
    name: "Robert Williams",
    age: 72,
    gender: "M",
    condition: "Heart Failure, Diabetes",
    riskScore: 55,
    lastUpdated: "2024-09-08T14:45:00Z",
    status: "medium",
    dashboardScores: {
      vitals: 60,
      medication: 70,
      lifestyle: 45,
      labs: 65
    },
    trends: {
      vitals: "stable",
      medication: "improving",
      lifestyle: "declining",
      labs: "stable"
    },
    riskFactors: [
      {
        factor: "Exercise Capacity",
        impact: 22,
        description: "Reduced activity levels over past month"
      },
      {
        factor: "Fluid Retention",
        impact: 18,
        description: "Mild edema and weight gain"
      },
      {
        factor: "Sleep Quality",
        impact: 15,
        description: "Reported poor sleep quality"
      }
    ],
    recommendations: [
      "Cardiology follow-up appointment",
      "Adjust diuretic therapy",
      "Physical therapy consultation",
      "Sleep study evaluation"
    ]
  },
  {
    id: "P004",
    name: "Maria Rodriguez",
    age: 61,
    gender: "F",
    condition: "Diabetes, Kidney Disease",
    riskScore: 78,
    lastUpdated: "2024-09-08T11:20:00Z",
    status: "high",
    dashboardScores: {
      vitals: 45,
      medication: 65,
      lifestyle: 55,
      labs: 25
    },
    trends: {
      vitals: "declining",
      medication: "stable",
      lifestyle: "stable",
      labs: "declining"
    },
    riskFactors: [
      {
        factor: "Kidney Function",
        impact: 35,
        description: "Creatinine levels rising, eGFR declining"
      },
      {
        factor: "Protein in Urine",
        impact: 25,
        description: "Persistent proteinuria"
      },
      {
        factor: "Blood Pressure",
        impact: 18,
        description: "Difficult to control hypertension"
      }
    ],
    recommendations: [
      "Urgent nephrology referral",
      "Adjust antihypertensive medications",
      "Protein restriction diet consultation",
      "Consider ACE inhibitor optimization"
    ]
  },
  {
    id: "P005",
    name: "David Thompson",
    age: 58,
    gender: "M",
    condition: "Metabolic Syndrome",
    riskScore: 42,
    lastUpdated: "2024-09-08T08:30:00Z",
    status: "medium",
    dashboardScores: {
      vitals: 65,
      medication: 80,
      lifestyle: 50,
      labs: 70
    },
    trends: {
      vitals: "stable",
      medication: "stable",
      lifestyle: "improving",
      labs: "improving"
    },
    riskFactors: [
      {
        factor: "Waist Circumference",
        impact: 20,
        description: "Central obesity with 42-inch waist"
      },
      {
        factor: "Triglycerides",
        impact: 15,
        description: "Elevated triglyceride levels"
      },
      {
        factor: "HDL Cholesterol",
        impact: 12,
        description: "Low HDL cholesterol"
      }
    ],
    recommendations: [
      "Increase aerobic exercise",
      "Consider statin therapy",
      "Weight management program",
      "Dietary consultation for Mediterranean diet"
    ]
  }
];

export const cohortStats = {
  totalPatients: demoPatients.length,
  highRisk: demoPatients.filter(p => p.status === 'high').length,
  mediumRisk: demoPatients.filter(p => p.status === 'medium').length,
  lowRisk: demoPatients.filter(p => p.status === 'low').length,
  averageRiskScore: Math.round(demoPatients.reduce((sum, p) => sum + p.riskScore, 0) / demoPatients.length),
  riskDistribution: [
    { range: '0-30', count: demoPatients.filter(p => p.riskScore < 30).length, color: '#10b981' },
    { range: '30-50', count: demoPatients.filter(p => p.riskScore >= 30 && p.riskScore < 50).length, color: '#f59e0b' },
    { range: '50-70', count: demoPatients.filter(p => p.riskScore >= 50 && p.riskScore < 70).length, color: '#ef4444' },
    { range: '70-100', count: demoPatients.filter(p => p.riskScore >= 70).length, color: '#dc2626' }
  ]
};

// Sample vital signs data for charts
export const generateVitalSigns = (patientId: string): VitalReading[] => {
  const baseData = {
    P001: { systolic: 165, diastolic: 95, heartRate: 78, glucose: 180, weight: 220 },
    P002: { systolic: 125, diastolic: 78, heartRate: 65, glucose: 110, weight: 165 },
    P003: { systolic: 140, diastolic: 85, heartRate: 72, glucose: 140, weight: 195 },
    P004: { systolic: 155, diastolic: 90, heartRate: 80, glucose: 160, weight: 175 },
    P005: { systolic: 135, diastolic: 82, heartRate: 70, glucose: 125, weight: 210 }
  };

  const base = baseData[patientId as keyof typeof baseData] || baseData.P001;
  const data: VitalReading[] = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      systolic: base.systolic + (Math.random() - 0.5) * 20,
      diastolic: base.diastolic + (Math.random() - 0.5) * 15,
      heartRate: base.heartRate + (Math.random() - 0.5) * 10,
      glucose: base.glucose + (Math.random() - 0.5) * 40,
      weight: base.weight + (Math.random() - 0.5) * 5
    });
  }
  
  return data;
};

export const generateLabResults = (patientId: string): LabResult[] => {
  const baseData = {
    P001: { hba1c: 8.5, cholesterol: 240, hdl: 35, ldl: 165, creatinine: 1.2 },
    P002: { hba1c: 5.8, cholesterol: 180, hdl: 55, ldl: 110, creatinine: 0.9 },
    P003: { hba1c: 7.2, cholesterol: 200, hdl: 45, ldl: 135, creatinine: 1.1 },
    P004: { hba1c: 8.0, cholesterol: 220, hdl: 40, ldl: 150, creatinine: 1.8 },
    P005: { hba1c: 6.5, cholesterol: 210, hdl: 42, ldl: 140, creatinine: 1.0 }
  };

  const base = baseData[patientId as keyof typeof baseData] || baseData.P001;
  const data: LabResult[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      hba1c: base.hba1c + (Math.random() - 0.5) * 1.0,
      cholesterol: base.cholesterol + (Math.random() - 0.5) * 30,
      hdl: base.hdl + (Math.random() - 0.5) * 10,
      ldl: base.ldl + (Math.random() - 0.5) * 25,
      creatinine: base.creatinine + (Math.random() - 0.5) * 0.3
    });
  }
  
  return data;
};

export const generateMedicationAdherence = (patientId: string): MedicationAdherence[] => {
  const baseAdherence = {
    P001: 60,
    P002: 95,
    P003: 70,
    P004: 65,
    P005: 80
  };

  const base = baseAdherence[patientId as keyof typeof baseAdherence] || 70;
  const data: MedicationAdherence[] = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const adherence = Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 20));
    
    data.push({
      date: date.toISOString().split('T')[0],
      adherenceRate: adherence,
      missedDoses: Math.round((100 - adherence) / 10)
    });
  }
  
  return data;
};
