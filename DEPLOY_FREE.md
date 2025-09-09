# 🚀 Free Deployment Guide for WellDOC Backend

## Quick Deploy to Render.com (Recommended - Free)

### 1. **One-Click Deploy** 
Since your code is already on GitHub, you can deploy with these simple steps:

1. **Go to [Render.com](https://render.com)** and sign up with your GitHub account
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository:** `sakethksg/WellDoc`
4. **Render will automatically detect the `render.yaml` file** and configure everything
5. **Click "Deploy"** - That's it! 🎉

### 2. **Manual Configuration** (if render.yaml doesn't work)

If you prefer manual setup:

1. **New Web Service** on Render
2. **Configure these settings:**
   ```
   Name: welldoc-backend
   Runtime: Python 3
   Build Command: cd backend && pip install -r ../requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. **Environment Variables:**
   ```
   PYTHONUNBUFFERED = 1
   ENVIRONMENT = production
   ```

### 3. **Your API will be live at:**
```
https://welldoc-backend-[random].onrender.com
```

## 🔄 Alternative Free Options

### **Railway.app** (ML-Friendly)
1. **Visit [Railway.app](https://railway.app)**
2. **Deploy from GitHub** - connect your repo
3. **Auto-detects Python** and requirements.txt
4. **Environment Variables:**
   ```bash
   PORT=8000
   PYTHONUNBUFFERED=1
   ```

### **Fly.io** (High Performance)
1. **Install flyctl:** `curl -L https://fly.io/install.sh | sh`
2. **Login:** `fly auth login`
3. **Deploy:** `fly deploy`
4. **Auto-generates fly.toml** from your code

### **Google Cloud Run** (Google Credits)
1. **Enable Cloud Run API**
2. **Build:** `gcloud builds submit --tag gcr.io/PROJECT_ID/welldoc`
3. **Deploy:** `gcloud run deploy --image gcr.io/PROJECT_ID/welldoc --platform managed`

## 📋 Pre-Deployment Checklist

### ✅ **Code Ready:**
- [x] FastAPI app in `backend/main.py`
- [x] Requirements.txt with all dependencies
- [x] Health check endpoint at `/health`
- [x] Environment variable support for PORT

### ✅ **Repository Ready:**
- [x] Code pushed to GitHub
- [x] render.yaml configuration file
- [x] Public repository or connected to deployment service

### ✅ **Model Files:**
Make sure your ML model files are included:
```
backend/artifacts/
├── final_model_xgboost.pkl
├── feature_scaler.pkl
├── label_encoder.pkl
├── feature_metadata.json
└── model_metadata.json
```

## 🛠️ Troubleshooting

### **Build Fails:**
- Check if all requirements are in `requirements.txt`
- Verify Python version compatibility
- Check file paths in commands

### **App Doesn't Start:**
- Ensure `uvicorn` is in requirements.txt
- Check PORT environment variable usage
- Verify health check endpoint works

### **Model Loading Issues:**
- Confirm model files are in the repository
- Check file paths in your code
- Verify model files aren't too large (most free tiers have limits)

## 💰 **Cost Breakdown (All FREE!)**

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Render** | ✅ Free | 500 build hours/month, sleeps after 15min |
| **Railway** | ✅ Free | $5 credit/month, sleeps when idle |
| **Fly.io** | ✅ Free | 3 shared VMs, 160GB transfer |
| **Google Cloud** | ✅ Free | 2M requests/month, 180k vCPU-seconds |

## 🚀 **Recommended Next Steps:**

1. **Deploy to Render first** (easiest)
2. **Test your API** with the provided endpoints
3. **Update your frontend** to use the new API URL
4. **Set up monitoring** (UptimeRobot is free)
5. **Add custom domain** if needed

## 📱 **Testing Your Deployment:**

Once deployed, test these endpoints:
```bash
# Health check
curl https://your-app.onrender.com/health

# API documentation
https://your-app.onrender.com/docs

# Sample prediction
curl -X POST https://your-app.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"age": 65, "gender_male": 1, "bmi": 28.5, ...}'
```

---

**🎉 That's it! Your WellDOC backend will be live and free!**

Need help? The deployment usually takes 2-5 minutes and you'll get a live URL to test your API.
