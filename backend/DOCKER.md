# WellDoc Backend Docker Deployment

This directory contains Docker configuration for the WellDoc AI Risk Prediction API backend.

## Quick Start

### Option 1: Using Build Scripts (Recommended)

**Windows:**
```powershell
# Navigate to backend directory
cd backend

# Run the build script
./docker-build.bat

# Or to rebuild from scratch
./docker-build.bat --rebuild
```

**Linux/MacOS:**
```bash
# Navigate to backend directory
cd backend

# Make script executable and run
chmod +x docker-build.sh
./docker-build.sh

# Or to rebuild from scratch
./docker-build.sh --rebuild
```

### Option 2: Using Docker Compose Directly

```bash
# Build and start the container
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Option 3: Using Docker Commands Directly

```bash
# Build the image
docker build -t welldoc-backend .

# Run the container
docker run -d \
  --name welldoc-api \
  -p 8000:8000 \
  -v $(pwd)/artifacts:/app/artifacts:ro \
  -v $(pwd)/logs:/app/logs \
  welldoc-backend
```

## API Access

Once the container is running, the API will be available at:

- **API Base URL:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **Interactive Docs:** http://localhost:8000/docs
- **ReDoc Documentation:** http://localhost:8000/redoc

## Container Management

### View Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Recent logs only
docker-compose logs --tail=50 -f
```

### Access Container Shell
```bash
docker-compose exec welldoc-backend /bin/bash
```

### Restart Container
```bash
docker-compose restart
```

### Stop and Remove Container
```bash
docker-compose down
```

### Update and Rebuild
```bash
# Pull latest changes and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Environment Configuration

The container uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

Key environment variables:
- `ENVIRONMENT`: Set to `production` for production deployment
- `LOG_LEVEL`: Set logging level (`debug`, `info`, `warning`, `error`)
- `CORS_ORIGINS`: Allowed origins for CORS
- `API_HOST`: Host to bind to (default: `0.0.0.0`)
- `API_PORT`: Port to run on (default: `8000`)

## Volumes

The Docker setup includes two volume mounts:

1. **Artifacts (Read-only):** `./artifacts:/app/artifacts:ro`
   - Contains trained ML models and metadata
   - Mounted as read-only for security

2. **Logs:** `./logs:/app/logs`
   - Application logs
   - Persisted outside container for monitoring

## Health Checks

The container includes built-in health checks:
- **Endpoint:** `/health`
- **Interval:** Every 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3 attempts
- **Start Period:** 40 seconds (time to wait before first check)

## Security Features

- **Non-root User:** Container runs as non-root user `app`
- **Read-only Artifacts:** Model files are mounted read-only
- **Minimal Base Image:** Uses Python slim image for smaller attack surface
- **No Cache:** pip packages installed without cache to reduce image size

## Production Deployment

For production deployment:

1. **Set Environment Variables:**
   ```bash
   export ENVIRONMENT=production
   export LOG_LEVEL=info
   ```

2. **Use Production Docker Compose:**
   ```yaml
   # Add to docker-compose.yml for production
   environment:
     - ENVIRONMENT=production
     - LOG_LEVEL=info
   restart: always
   ```

3. **Configure Reverse Proxy:**
   Use nginx or similar to proxy requests to the container:
   ```nginx
   location /api/ {
       proxy_pass http://localhost:8000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

4. **Monitor Health:**
   ```bash
   # Monitor health endpoint
   curl -f http://localhost:8000/health
   ```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs welldoc-backend

# Check if port is already in use
netstat -tlnp | grep 8000

# Try different port
docker-compose down
# Edit docker-compose.yml to use different port
docker-compose up -d
```

### Health Check Fails
```bash
# Check container status
docker-compose ps

# Check application logs
docker-compose logs -f welldoc-backend

# Test health endpoint manually
curl -v http://localhost:8000/health
```

### Model Loading Issues
```bash
# Verify artifacts directory exists and contains model files
ls -la artifacts/

# Check container can access artifacts
docker-compose exec welldoc-backend ls -la /app/artifacts/
```

### Performance Issues
```bash
# Monitor resource usage
docker stats welldoc-api

# Increase memory if needed (add to docker-compose.yml)
services:
  welldoc-backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## Development

For development with live code reloading:

```bash
# Mount source code as volume for development
docker run -d \
  --name welldoc-dev \
  -p 8000:8000 \
  -v $(pwd):/app \
  -v $(pwd)/artifacts:/app/artifacts:ro \
  welldoc-backend \
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
