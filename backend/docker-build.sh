#!/bin/bash

# Build and run WellDoc Backend Docker Container
# Usage: ./docker-build.sh [--rebuild]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  WellDoc Backend Docker Setup${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
if [ "$1" = "--rebuild" ]; then
    echo -e "${YELLOW}🔄 Rebuilding from scratch (no cache)...${NC}"
    docker-compose build --no-cache
else
    docker-compose build
fi

# Start the container
echo -e "${YELLOW}🚀 Starting WellDoc Backend...${NC}"
docker-compose up -d

# Wait for the service to be healthy
echo -e "${YELLOW}⏳ Waiting for service to be ready...${NC}"
sleep 10

# Check if the service is running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ WellDoc Backend is running successfully!${NC}"
    echo ""
    echo -e "${BLUE}📡 API Information:${NC}"
    echo "   - API URL: http://localhost:8000"
    echo "   - Health Check: http://localhost:8000/health"
    echo "   - API Docs: http://localhost:8000/docs"
    echo "   - Redoc: http://localhost:8000/redoc"
    echo ""
    echo -e "${BLUE}🛠️  Docker Commands:${NC}"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop service: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo "   - Shell access: docker-compose exec welldoc-backend /bin/bash"
    echo ""
    
    # Test the health endpoint
    echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${RED}❌ Health check failed. Check logs with: docker-compose logs${NC}"
    fi
else
    echo -e "${RED}❌ Failed to start WellDoc Backend. Check logs with: docker-compose logs${NC}"
    exit 1
fi
