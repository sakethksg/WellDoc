"use client"

import { useState, useEffect } from "react"
import { Brain, Users, AlertTriangle, CheckCircle, Activity, TrendingUp, Search, Filter, User, Calendar, Heart } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
  feature_contributions?: Array<{
    feature: string
    contribution: number
    clinical_name: string
  }>
}

function getRiskColor(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'high':
      return 'text-destructive'
    case 'medium':
      return 'text-orange-600'
    case 'low':
      return 'text-green-600'
    default:
      return 'text-muted-foreground'
  }
}

function getRiskIcon(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    case 'medium':
      return <TrendingUp className="h-5 w-5 text-orange-600" />
    case 'low':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />
  }
}

export function RiskPredictionContent() {
  const [patients, setPatients] = useState<PatientData[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [prediction, setPrediction] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // New state for improved patient selection
  const [searchQuery, setSearchQuery] = useState("")
  const [ageFilter, setAgeFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [insuranceFilter, setInsuranceFilter] = useState("all")

  // Load patients on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch('/data/patient_database.json')
        const data = await response.json()
        setPatients(data.patients)
      } catch (err) {
        setError('Failed to load patients')
        console.error('Patient loading error:', err)
      }
    }

    loadPatients()
  }, [])

  // Helper function to get insurance type
  const getInsuranceType = (patient: PatientData) => {
    const clinical = patient.clinicalData
    if (clinical.insurance_medicaid === 1) return 'medicaid'
    if (clinical.insurance_medicare === 1) return 'medicare'
    if (clinical.insurance_private === 1) return 'private'
    return 'unknown'
  }

  // Helper function to get age group
  const getAgeGroup = (age: number) => {
    if (age <= 30) return 'young'
    if (age <= 50) return 'middle'
    if (age <= 70) return 'senior'
    return 'elderly'
  }

  // Helper function to get risk level based on condition count
  const getPatientRiskLevel = (conditions: string[]) => {
    if (conditions.length <= 1) return 'low'
    if (conditions.length <= 3) return 'medium'
    return 'high'
  }

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.conditions.some(condition => 
        condition.toLowerCase().includes(searchQuery.toLowerCase())
      )

    // Age filter
    const matchesAge = ageFilter === "all" || getAgeGroup(patient.age) === ageFilter

    // Condition filter
    const matchesCondition = conditionFilter === "all" || 
      patient.conditions.some(condition => 
        condition.toLowerCase() === conditionFilter.toLowerCase()
      )

    // Insurance filter
    const matchesInsurance = insuranceFilter === "all" || 
      getInsuranceType(patient) === insuranceFilter

    return matchesSearch && matchesAge && matchesCondition && matchesInsurance
  })

  const handlePredictRisk = async () => {
    if (!selectedPatientId) return

    const selectedPatient = patients.find(p => p.id === selectedPatientId)
    if (!selectedPatient) return

    try {
      setLoading(true)
      setError(null)
      setPrediction(null)

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          ...selectedPatient.clinicalData
        })
      })

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`)
      }

      const result = await response.json()
      setPrediction(result)
      
      // Store prediction in localStorage for dashboard persistence
      const existingPredictions = JSON.parse(localStorage.getItem('riskPredictions') || '[]')
      const updatedPredictions = existingPredictions.filter((p: RiskResult) => p.patient_id !== result.patient_id)
      updatedPredictions.push(result)
      localStorage.setItem('riskPredictions', JSON.stringify(updatedPredictions))
    } catch (err) {
      setError('Failed to get risk prediction')
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Risk Prediction</h1>
        <p className="text-muted-foreground">
          Get real-time 90-day deterioration risk assessment for individual patients
        </p>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Patient
          </CardTitle>
          <CardDescription>
            Browse and search through {patients.length} patients in the chronic care cohort
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Patients</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Age Group</Label>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="young">≤30 years</SelectItem>
                    <SelectItem value="middle">31-50 years</SelectItem>
                    <SelectItem value="senior">51-70 years</SelectItem>
                    <SelectItem value="elderly">71+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Condition</Label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="diabetes">Diabetes</SelectItem>
                    <SelectItem value="hypertension">Hypertension</SelectItem>
                    <SelectItem value="heart disease">Heart Disease</SelectItem>
                    <SelectItem value="copd">COPD</SelectItem>
                    <SelectItem value="kidney disease">Kidney Disease</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Insurance</Label>
                <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Insurance</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="medicaid">Medicaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Patient Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Patients ({filteredPatients.length})</Label>
              {searchQuery || ageFilter !== "all" || conditionFilter !== "all" || insuranceFilter !== "all" ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setAgeFilter("all")
                    setConditionFilter("all")
                    setInsuranceFilter("all")
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : null}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <Card 
                  key={patient.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPatientId === patient.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{patient.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getPatientRiskLevel(patient.conditions) === 'high' ? '🔴' : 
                           getPatientRiskLevel(patient.conditions) === 'medium' ? '🟡' : '🟢'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {patient.age} years • {patient.gender}
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-3 w-3" />
                          {patient.conditions.length} condition{patient.conditions.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.slice(0, 2).map((condition, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {patient.conditions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{patient.conditions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients match your search criteria</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Selected Patient
              </h4>
              <div className="grid gap-2 text-sm">
                <div><strong>Name:</strong> {selectedPatient.name}</div>
                <div><strong>Age:</strong> {selectedPatient.age} years</div>
                <div><strong>Gender:</strong> {selectedPatient.gender}</div>
                <div><strong>Conditions:</strong> {selectedPatient.conditions.join(', ')}</div>
                <div><strong>Last Visit:</strong> {new Date(selectedPatient.lastVisit).toLocaleDateString()}</div>
                <div><strong>Insurance:</strong> {
                  getInsuranceType(selectedPatient).charAt(0).toUpperCase() + 
                  getInsuranceType(selectedPatient).slice(1)
                }</div>
              </div>
            </div>
          )}

          <Button 
            onClick={handlePredictRisk} 
            disabled={!selectedPatientId || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Predict Risk
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRiskIcon(prediction.risk_assessment.risk_level)}
                Risk Assessment Results
              </CardTitle>
              <CardDescription>
                AI-generated 90-day deterioration risk for {selectedPatient?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Score */}
              <div className="text-center p-6 border rounded-lg">
                <div className={`text-4xl font-bold mb-2 ${getRiskColor(prediction.risk_assessment.risk_level)}`}>
                  {(prediction.risk_assessment.deterioration_probability * 100).toFixed(1)}%
                </div>
                <div className="text-lg text-muted-foreground mb-4">
                  90-Day Deterioration Risk
                </div>
                <Badge 
                  variant={prediction.risk_assessment.risk_level === 'high' ? 'destructive' : 'default'}
                  className="text-sm px-3 py-1"
                >
                  {prediction.risk_assessment.risk_level.toUpperCase()} RISK
                </Badge>
              </div>

              <Separator />

              {/* Assessment Details */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(prediction.risk_assessment.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize">
                    {prediction.risk_assessment.priority}
                  </div>
                  <div className="text-sm text-muted-foreground">Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize">
                    {prediction.risk_assessment.urgency}
                  </div>
                  <div className="text-sm text-muted-foreground">Urgency</div>
                </div>
              </div>

              {/* Clinical Recommendations */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Clinical Recommendations
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {prediction.risk_assessment.risk_level === 'high' && (
                    <>
                      • Schedule immediate follow-up within 1-2 weeks<br/>
                      • Consider medication review and optimization<br/>
                      • Implement enhanced monitoring protocols<br/>
                      • Coordinate with care team for intervention planning
                    </>
                  )}
                  {prediction.risk_assessment.risk_level === 'medium' && (
                    <>
                      • Schedule follow-up within 2-4 weeks<br/>
                      • Review medication adherence<br/>
                      • Monitor key vital signs and symptoms<br/>
                      • Patient education on warning signs
                    </>
                  )}
                  {prediction.risk_assessment.risk_level === 'low' && (
                    <>
                      • Continue routine monitoring schedule<br/>
                      • Maintain current treatment plan<br/>
                      • Encourage adherence to medications<br/>
                      • Next routine visit as scheduled
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
