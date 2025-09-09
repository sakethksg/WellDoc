"use client"

import { useState, useEffect } from "react"
import { Users, AlertTriangle, Activity, TrendingDown, TrendingUp, Calendar, Brain } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Patient data interface
interface PatientData {
  id: string
  name: string
  age: number
  gender: string
  conditions: string[]
  lastVisit: string
  clinicalData: Record<string, number | string | boolean>
}

// Risk prediction result interface
interface RiskResult {
  patient_id: string
  risk_assessment: {
    deterioration_probability: number
    risk_level: string
    priority: string
    urgency: string
    confidence: number
  }
}

function getRiskBadgeColor(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'default'
  }
}

function getUrgencyIcon(urgency: string) {
  switch (urgency.toLowerCase()) {
    case 'immediate':
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    case 'urgent':
      return <TrendingUp className="h-4 w-4 text-orange-500" />
    case 'routine':
      return <Calendar className="h-4 w-4 text-blue-500" />
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />
  }
}

export function CohortContent() {
  const [patients, setPatients] = useState<PatientData[]>([])
  const [riskPredictions, setRiskPredictions] = useState<RiskResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on component mount
  useEffect(() => {
    const loadCohortData = async () => {
      try {
        setLoading(true)
        
        // Load patients from database
        const patientsResponse = await fetch('/data/patient_database.json')
        const patientsData = await patientsResponse.json()
        setPatients(patientsData.patients)

        // Load previously stored predictions from localStorage
        const storedPredictions = localStorage.getItem('riskPredictions')
        if (storedPredictions) {
          setRiskPredictions(JSON.parse(storedPredictions))
        }

      } catch (err) {
        setError('Failed to load cohort data')
        console.error('Cohort data loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCohortData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cohort data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>{error}</p>
      </div>
    )
  }

  // Combine patient data with risk predictions
  const cohortData = patients.map(patient => {
    const prediction = riskPredictions.find(p => p.patient_id === patient.id)
    return {
      ...patient,
      prediction
    }
  }).sort((a, b) => {
    // Sort by risk level: high -> medium -> low
    const riskOrder = { 'high': 3, 'medium': 2, 'low': 1 }
    const aRisk = a.prediction?.risk_assessment.risk_level.toLowerCase() || 'low'
    const bRisk = b.prediction?.risk_assessment.risk_level.toLowerCase() || 'low'
    return (riskOrder[bRisk as keyof typeof riskOrder] || 1) - (riskOrder[aRisk as keyof typeof riskOrder] || 1)
  })

  const highRiskCount = riskPredictions.filter(p => p.risk_assessment.risk_level === 'high').length
  const totalPatients = patients.length
  const predictedPatients = riskPredictions.length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cohort Management</h1>
        <p className="text-muted-foreground">
          Monitor all chronic care patients with AI-driven 90-day deterioration risk scores
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Active chronic care cohort</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{predictedPatients}</div>
            <p className="text-xs text-muted-foreground">
              {totalPatients > 0 ? Math.round((predictedPatients / totalPatients) * 100) : 0}% assessed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {predictedPatients > 0 ? Math.round((highRiskCount / predictedPatients) * 100) : 0}% of predicted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskPredictions.length > 0 
                ? (riskPredictions.reduce((sum, p) => sum + p.risk_assessment.deterioration_probability, 0) / riskPredictions.length * 100).toFixed(1)
                : '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">90-day deterioration risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Table */}
      {predictedPatients > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Patient Risk Scores</CardTitle>
            <CardDescription>
              Real-time AI predictions for assessed patients, sorted by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohortData.filter(patient => patient.prediction).map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {patient.conditions.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {patient.prediction 
                      ? (patient.prediction.risk_assessment.deterioration_probability * 100).toFixed(1) + '%'
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {patient.prediction && (
                      <Badge variant={getRiskBadgeColor(patient.prediction.risk_assessment.risk_level) as "destructive" | "default" | "secondary"}>
                        {patient.prediction.risk_assessment.risk_level}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {patient.prediction && getUrgencyIcon(patient.prediction.risk_assessment.urgency)}
                      <span className="text-sm">
                        {patient.prediction?.risk_assessment.urgency || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {patient.prediction 
                      ? (patient.prediction.risk_assessment.confidence * 100).toFixed(0) + '%'
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{new Date(patient.lastVisit).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Risk Assessments Yet</CardTitle>
            <CardDescription>
              Start by predicting individual patient risks using the AI Risk Prediction tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No patients have been assessed yet. Use the Risk Prediction page to analyze individual patients.
              </p>
              <Link href="/risk-prediction">
                <Button>
                  <Brain className="mr-2 h-4 w-4" />
                  Start Risk Assessment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
