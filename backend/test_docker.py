#!/usr/bin/env python3
"""
Test script for WellDoc Backend Docker deployment
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_health_check() -> bool:
    """Test the health check endpoint"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data.get('status', 'Unknown')}")
            print(f"   Model loaded: {health_data.get('model_loaded', False)}")
            print(f"   Model name: {health_data.get('model_name', 'Unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint() -> bool:
    """Test the root endpoint"""
    print("\n🏠 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint working: {data.get('message', 'Unknown')}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_model_info() -> bool:
    """Test the model info endpoint"""
    print("\n🧠 Testing model info endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/model/info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Model info endpoint working")
            print(f"   Features available: {len(data.get('feature_importance', []))}")
            return True
        else:
            print(f"❌ Model info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model info error: {e}")
        return False

def test_prediction_endpoint() -> bool:
    """Test the prediction endpoint with sample data"""
    print("\n🔮 Testing prediction endpoint...")
    
    # Sample patient data
    sample_patient = {
        "patient_id": "test_patient_001",
        "age": 65,
        "gender_male": 1,
        "has_diabetes": 1,
        "has_hypertension": 1,
        "has_heart_disease": 0,
        "has_kidney_disease": 0,
        "has_stroke": 0,
        "has_copd": 0,
        "has_depression": 0,
        "has_cancer": 0,
        "bmi": 28.5,
        "systolic_bp": 140.0,
        "diastolic_bp": 90.0,
        "heart_rate": 75.0,
        "glucose": 150.0,
        "hba1c": 7.2,
        "cholesterol": 220.0,
        "total_encounters": 3,
        "inpatient_visits": 0,
        "emergency_visits": 1,
        "outpatient_visits": 2,
        "medication_count": 4
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict", 
            json=sample_patient,
            timeout=30
        )
        
        if response.status_code == 200:
            prediction = response.json()
            print("✅ Prediction endpoint working")
            print(f"   Patient ID: {prediction.get('patient_id', 'Unknown')}")
            print(f"   Risk Level: {prediction.get('risk_assessment', {}).get('risk_level', 'Unknown')}")
            print(f"   Probability: {prediction.get('risk_assessment', {}).get('deterioration_probability', 0):.3f}")
            print(f"   Recommendations: {len(prediction.get('recommendations', []))}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            if response.text:
                print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def wait_for_service(max_wait: int = 60) -> bool:
    """Wait for the service to be ready"""
    print(f"⏳ Waiting for service to be ready (max {max_wait} seconds)...")
    
    start_time = time.time()
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Service is ready!")
                return True
        except:
            pass
        
        print(".", end="", flush=True)
        time.sleep(2)
    
    print(f"\n❌ Service not ready after {max_wait} seconds")
    return False

def main():
    """Main test function"""
    print("🚀 WellDoc Backend Docker Test Suite")
    print("=" * 40)
    
    # Wait for service to be ready
    if not wait_for_service():
        print("\n❌ Service not available. Make sure Docker container is running.")
        print("   Try: docker-compose up -d")
        sys.exit(1)
    
    # Run tests
    tests = [
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("Model Info", test_model_info),
        ("Prediction", test_prediction_endpoint),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            failed += 1
    
    # Summary
    print("\n" + "=" * 40)
    print(f"📊 Test Summary:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📈 Success Rate: {passed/(passed+failed)*100:.1f}%")
    
    if failed == 0:
        print("\n🎉 All tests passed! Docker deployment is working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {failed} tests failed. Check the logs for details.")
        print("   View logs: docker-compose logs -f")
        sys.exit(1)

if __name__ == "__main__":
    main()
