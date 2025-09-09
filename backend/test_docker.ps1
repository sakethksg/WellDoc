# WellDoc Backend Docker Test Script for PowerShell
# Usage: .\test_docker.ps1

param(
    [string]$BaseUrl = "http://localhost:8000",
    [int]$TimeoutSeconds = 30
)

Write-Host "🚀 WellDoc Backend Docker Test Suite" -ForegroundColor Blue
Write-Host "=" * 40

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$TestName,
        [hashtable]$Body = $null,
        [string]$Method = "GET"
    )
    
    Write-Host "`n🧪 Testing $TestName..." -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $TestName passed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $TestName failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Wait-ForService {
    param([int]$MaxWaitSeconds = 60)
    
    Write-Host "⏳ Waiting for service to be ready (max $MaxWaitSeconds seconds)..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    while ((Get-Date) - $startTime -lt [TimeSpan]::FromSeconds($MaxWaitSeconds)) {
        try {
            $response = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec 5
            if ($response) {
                Write-Host "✅ Service is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Continue waiting
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    
    Write-Host "`n❌ Service not ready after $MaxWaitSeconds seconds" -ForegroundColor Red
    return $false
}

# Wait for service
if (-not (Wait-ForService)) {
    Write-Host "`n❌ Service not available. Make sure Docker container is running." -ForegroundColor Red
    Write-Host "   Try: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Test health check
if (Test-Endpoint -Url "$BaseUrl/health" -TestName "Health Check") {
    $passed++
} else {
    $failed++
}

# Test root endpoint
if (Test-Endpoint -Url "$BaseUrl/" -TestName "Root Endpoint") {
    $passed++
} else {
    $failed++
}

# Test model info
if (Test-Endpoint -Url "$BaseUrl/model/info" -TestName "Model Info") {
    $passed++
} else {
    $failed++
}

# Test prediction endpoint
$samplePatient = @{
    patient_id = "test_patient_001"
    age = 65
    gender_male = 1
    has_diabetes = 1
    has_hypertension = 1
    has_heart_disease = 0
    has_kidney_disease = 0
    has_stroke = 0
    has_copd = 0
    has_depression = 0
    has_cancer = 0
    bmi = 28.5
    systolic_bp = 140.0
    diastolic_bp = 90.0
    heart_rate = 75.0
    glucose = 150.0
    hba1c = 7.2
    cholesterol = 220.0
    total_encounters = 3
    inpatient_visits = 0
    emergency_visits = 1
    outpatient_visits = 2
    medication_count = 4
}

if (Test-Endpoint -Url "$BaseUrl/predict" -TestName "Prediction" -Body $samplePatient -Method "POST") {
    $passed++
} else {
    $failed++
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 40
Write-Host "📊 Test Summary:" -ForegroundColor Blue
Write-Host "   ✅ Passed: $passed" -ForegroundColor Green
Write-Host "   ❌ Failed: $failed" -ForegroundColor Red

$successRate = if (($passed + $failed) -gt 0) { ($passed / ($passed + $failed)) * 100 } else { 0 }
Write-Host "   📈 Success Rate: $([math]::Round($successRate, 1))%" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n🎉 All tests passed! Docker deployment is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  $failed tests failed. Check the logs for details." -ForegroundColor Yellow
    Write-Host "   View logs: docker-compose logs -f" -ForegroundColor Yellow
    exit 1
}
