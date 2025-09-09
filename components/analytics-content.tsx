"use client"

import { useState, useEffect } from "react"
import { Brain, Target, BarChart3, Info } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Model info interface
interface ModelInfo {
  feature_importance: Array<{
    feature: string
    shap_importance: number
  }>
  clinical_mapping: Record<string, string>
  model_performance: {
    auroc: number
    auprc: number
  }
}

const chartConfig = {
  importance: {
    label: "SHAP Importance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AnalyticsContent() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/model/info')
        const data = await response.json()
        setModelInfo(data)
      } catch (err) {
        setError('Failed to load model analytics')
        console.error('Model info loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadModelInfo()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading model analytics...</span>
      </div>
    )
  }

  if (error || !modelInfo) {
    return (
      <div className="text-center text-red-500 p-8">
        <Target className="h-12 w-12 mx-auto mb-4" />
        <p>{error || 'No model information available'}</p>
      </div>
    )
  }

  // Get top 10 most important features for visualization
  const topFeatures = modelInfo.feature_importance
    .slice(0, 10)
    .map(item => {
      const clinicalName = modelInfo.clinical_mapping[item.feature] || item.feature
      // Shorten long feature names for better chart display
      const shortName = clinicalName.length > 20 
        ? clinicalName.substring(0, 17) + "..." 
        : clinicalName
      return {
        feature: shortName,
        fullFeature: clinicalName,
        importance: item.shap_importance,
        fill: "var(--chart-1)"
      }
    })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Analytics</h1>
        <p className="text-muted-foreground">
          XGBoost model performance metrics and feature importance analysis
        </p>
      </div>

      {/* Model Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AUROC Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(modelInfo.model_performance.auroc * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Area Under ROC Curve - Excellent discriminative ability
            </p>
            <div className="mt-2">
              <Badge variant={modelInfo.model_performance.auroc > 0.9 ? "default" : "secondary"}>
                {modelInfo.model_performance.auroc > 0.9 ? "Excellent" : "Good"} Performance
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AUPRC Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(modelInfo.model_performance.auprc * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Area Under Precision-Recall Curve - Handles class imbalance well
            </p>
            <div className="mt-2">
              <Badge variant={modelInfo.model_performance.auprc > 0.9 ? "default" : "secondary"}>
                {modelInfo.model_performance.auprc > 0.9 ? "Excellent" : "Good"} Precision
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Important Features</CardTitle>
          <CardDescription>
            SHAP values showing which clinical factors most influence risk predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[500px]">
            <BarChart data={topFeatures} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="feature" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                interval={0}
              />
              <YAxis 
                label={{ value: 'SHAP Importance', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                        <p className="font-medium">{data.fullFeature}</p>
                        <p className="text-sm text-muted-foreground">
                          SHAP: {data.importance.toFixed(4)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="importance" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Technical details about the AI risk prediction model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Model Type</h4>
              <p className="text-sm text-muted-foreground">XGBoost Classifier</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Prediction Window</h4>
              <p className="text-sm text-muted-foreground">90-day deterioration risk</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Input Features</h4>
              <p className="text-sm text-muted-foreground">{modelInfo.feature_importance.length} clinical variables</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Training Data</h4>
              <p className="text-sm text-muted-foreground">Synthetic chronic care patient cohort</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Key Clinical Predictors</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {modelInfo.feature_importance.slice(0, 6).map((item) => (
                <div key={item.feature} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">
                    {modelInfo.clinical_mapping[item.feature] || item.feature}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {item.shap_importance.toFixed(3)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">Model Interpretation</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Higher SHAP importance values indicate features that have more influence on the model&apos;s 
                  predictions. The most important factors are medication count, comorbidity count, and patient age.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
