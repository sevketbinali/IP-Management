# Complete Docker System Rebuild Guide

**Step-by-step instructions to rebuild the IP Management System from scratch**

This guide provides comprehensive instructions for rebuilding the entire IP Management & VLAN Segmentation System using Docker, including troubleshooting and optimization steps.

## 🎯 Overview

This guide covers:
- Complete system teardown and cleanup
- Fresh rebuild of all containers
- Database initialization and sample data
- Verification and testing procedures
- Performance optimization
- Troubleshooting common issues

## 📋 Prerequisites

Ensure you have:
- **Docker Engine** 20.10+
- **Docker Compose** 2.0+
- At least **4GB RAM** available for containers
- At least **10GB disk space** for images and volumes

## 🧹 Step 1: Complete System Cleanup

### 1.1 Stop All Running Containers
```bash
# Navigate to project directory
cd ip-management

# Stop all services
docker compose down

# Force stop if containers are unresponsive
docker compose kill
```

### 1.2 Remove All Project Containers and Volumes
```bash
# Remove containers and volumes (⚠️ THIS DELETES ALL DATA)
docker compose down -v

# Remove any orphaned containers
docker compose down --remove-orphans
```

### 1.3 Clean Up Docker System (Optional but Recommended)
```bash
# Remove unused containers, networks, and images
docker system prune -f

# Remove all unused images (more aggressive cleanup)
docker image prune -a -f

# Remove all unused volumes (⚠️ AFFECTS OTHER PROJECTS TOO)
docker volume prune -f

# Check available disk space
docker system df
```

### 1.4 Verify Cleanup
```bash
# Check no project containers are running
docker ps -a | grep ip_management

# Check no project volumes exist
docker volume ls | grep ip-management

# Should return empty results
```

## 🔧 Step 2: Environment Configuration

### 2.1 Prepare Environment Files
```bash
# Ensure you're in the project root
pwd
# Should show: /path/to/ip-management

# Copy main environment template
cp .env.example .env

# Copy frontend environment template
cp frontend/.env.example frontend/.env
```

### 2.2 Configure Main Environment (.env)
```bash
# Edit the main environment file
nano .env  # or use your preferred editor

# Key settings to verify/change:
```

```bash
# Database Configuration
POSTGRES_DB=ip_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password_change_in_production

# Application Security (⚠️ CHANGE FOR PRODUCTION)
SECRET_KEY=your-secret-key-change-in-production-32-chars

# Port Configuration (change if ports are in use)
API_PORT=8000
FRONTEND_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379

# Bosch Rexroth Configuration
PLANT_CODE=BURSA
ORGANIZATION="Bosch Rexroth"

# Frontend Configuration
FRONTEND_API_URL=http://localhost:8000/api/v1
FRONTEND_PLANT_CODE=BURSA
FRONTEND_ORGANIZATION="Bosch Rexroth"
FRONTEND_API_TIMEOUT=30000
FRONTEND_CACHE_DURATION=300000
FRONTEND_PAGINATION_SIZE=50
FRONTEND_ENABLE_DEBUG=false
FRONTEND_ENABLE_ANALYTICS=true
```

### 2.3 Configure Frontend Environment (frontend/.env)
```bash
# Edit frontend environment
nano frontend/.env

# Verify these settings:
```

```bash
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_PLANT_CODE=BURSA
VITE_ORGANIZATION="Bosch Rexroth"

# Performance Configuration
VITE_API_TIMEOUT=30000
VITE_CACHE_DURATION=300000
VITE_PAGINATION_SIZE=50

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### 2.4 Verify Configuration
```bash
# Check configuration syntax
docker compose config

# Should show parsed configuration without errors
```

## 🏗️ Step 3: Build All Containers

### 3.1 Build Backend Container
```bash
# Build backend with no cache
docker compose build --no-cache api

# Monitor build progress
# This may take 5-10 minutes depending on your internet connection
```

### 3.2 Build Frontend Container
```bash
# Build frontend with no cache
docker compose build --no-cache frontend

# Monitor build progress
# This may take 10-15 minutes for the first build
```

### 3.3 Build All Remaining Services
```bash
# Build all services
docker compose build --no-cache

# Alternative: Build specific services
docker compose build --no-cache postgres redis nginx
```

### 3.4 Verify Images
```bash
# List built images
docker images | grep ip-management

# Should show images for:
# - ip-management-api (or similar)
# - ip-management-frontend (or similar)
```

## 🚀 Step 4: Start Services in Order

### 4.1 Start Database Services First
```bash
# Start database and cache services
docker compose up -d postgres redis

# Wait for services to be healthy (30-60 seconds)
docker compose ps

# Check logs
docker compose logs postgres redis
```

### 4.2 Verify Database Connectivity
```bash
# Test database connection
docker compose exec postgres pg_isready -U postgres

# Should return: "postgres:5432 - accepting connections"

# Test Redis connection
docker compose exec redis redis-cli ping

# Should return: "PONG"
```

### 4.3 Start Backend API
```bash
# Start API service
docker compose up -d api

# Monitor startup logs
docker compose logs -f api

# Wait for "Application startup complete" message
# This may take 1-2 minutes
```

### 4.4 Verify Backend Health
```bash
# Test API health endpoint
curl http://localhost:8000/health

# Should return JSON with status: "healthy"

# Test API documentation
curl http://localhost:8000/api/docs

# Should return HTML page
```

### 4.5 Start Frontend
```bash
# Start frontend service
docker compose up -d frontend

# Monitor startup logs
docker compose logs -f frontend

# Wait for nginx to start serving
```

### 4.6 Verify Frontend
```bash
# Test frontend
curl http://localhost:3000/

# Should return HTML page

# Test frontend API connectivity
curl http://localhost:3000/api/health
```

## 📊 Step 5: Initialize Database and Sample Data

### 5.1 Apply Database Migrations
```bash
# Run database migrations
docker compose exec api alembic upgrade head

# Check migration status
docker compose exec api alembic current

# Should show current migration ID
```

### 5.2 Create Sample Data (Optional)
```bash
# Initialize Bosch Rexroth factory sample data
docker compose exec api python scripts/init-sample-data.py

# This creates:
# - Sample domains (MFG, LOG, FCM, ENG)
# - Value streams for each domain
# - Security zones with proper classifications
# - Sample VLANs with IP ranges
# - Sample IP allocations
```

### 5.3 Verify Database Content
```bash
# Connect to database
docker compose exec postgres psql -U postgres -d ip_management

# Check tables exist
\dt

# Check sample data
SELECT name, description FROM domains;
SELECT name, security_level FROM zones;
SELECT vlan_id, subnet FROM vlans;

# Exit database
\q
```

## ✅ Step 6: Verification and Testing

### 6.1 Service Health Check
```bash
# Check all services are running
docker compose ps

# All services should show "Up" status with health checks passing
```

### 6.2 Frontend Functionality Test
```bash
# Open browser and test:
# 1. Dashboard: http://localhost:3000
# 2. Domain Management: http://localhost:3000/domains
# 3. API Documentation: http://localhost:8000/api/docs

# Or test with curl:
curl -s http://localhost:3000/ | grep -i "IP Management"
curl -s http://localhost:8000/api/docs | grep -i "swagger"
```

### 6.3 API Functionality Test
```bash
# Test domain endpoints
curl http://localhost:8000/api/v1/domains

# Test health endpoint
curl http://localhost:8000/health

# Test VLAN endpoints
curl http://localhost:8000/api/v1/vlans

# All should return valid JSON responses
```

### 6.4 Database Connectivity Test
```bash
# Test from API container
docker compose exec api python -c "
from src.ip_management.database import get_db
from sqlalchemy import text
with next(get_db()) as db:
    result = db.execute(text('SELECT COUNT(*) FROM domains'))
    print(f'Domains count: {result.scalar()}')
"
```

## 🔧 Step 7: Performance Optimization

### 7.1 Resource Monitoring
```bash
# Monitor resource usage
docker stats

# Check container resource limits
docker compose exec api cat /sys/fs/cgroup/memory/memory.limit_in_bytes
```

### 7.2 Optimize Container Resources (Optional)
```bash
# Edit docker-compose.yml to add resource limits
nano docker-compose.yml

# Add to each service:
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### 7.3 Enable Production Optimizations
```bash
# For production deployment, use production profile
docker compose --profile production up -d

# This includes nginx reverse proxy and optimized settings
```

## 🚨 Step 8: Troubleshooting Common Issues

### 8.1 Port Conflicts
```bash
# If ports are in use, check what's using them:
# Windows:
netstat -an | findstr :8000

# macOS/Linux:
lsof -i :8000

# Solution: Change ports in .env file
API_PORT=8001
FRONTEND_PORT=3001
```

### 8.2 Memory Issues
```bash
# If containers are killed due to memory:
# Check available memory
free -h

# Increase Docker memory limit in Docker Desktop settings
# Or add swap space on Linux:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 8.3 Build Failures
```bash
# If frontend build fails due to memory:
# Add to frontend service in docker-compose.yml:
environment:
  - NODE_OPTIONS=--max_old_space_size=4096

# If backend build fails with UV issues:
# Switch to simple Dockerfile:
sed -i 's/Dockerfile.backend/Dockerfile.backend.simple/g' docker-compose.yml
```

### 8.4 Network Issues
```bash
# If containers can't communicate:
# Check Docker networks
docker network ls

# Recreate network
docker compose down
docker network prune -f
docker compose up -d
```

## 📈 Step 9: Performance Verification

### 9.1 Load Testing (Optional)
```bash
# Install Apache Bench (if not available)
# Ubuntu: sudo apt install apache2-utils
# macOS: brew install httpie

# Test API performance
ab -n 100 -c 10 http://localhost:8000/health

# Test frontend performance
ab -n 100 -c 10 http://localhost:3000/
```

### 9.2 Database Performance
```bash
# Check database performance
docker compose exec postgres psql -U postgres -d ip_management -c "
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY tablename, attname;
"
```

## 🎉 Step 10: Final Verification

### 10.1 Complete System Test
```bash
# Run all tests
docker compose exec api pytest tests/ -v
docker compose exec frontend npm test

# Check all endpoints
curl http://localhost:8000/health
curl http://localhost:3000/
curl http://localhost:8000/api/docs
```

### 10.2 Create System Backup
```bash
# Backup database
docker compose exec postgres pg_dump -U postgres ip_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup environment files
cp .env .env.backup
cp frontend/.env frontend/.env.backup
```

### 10.3 Document Current State
```bash
# Save current image versions
docker images | grep ip-management > docker_images_$(date +%Y%m%d_%H%M%S).txt

# Save container status
docker compose ps > container_status_$(date +%Y%m%d_%H%M%S).txt
```

## 🔄 Step 11: Maintenance Commands

### 11.1 Regular Maintenance
```bash
# Weekly cleanup (run when system is stopped)
docker system prune -f

# Monthly cleanup (more aggressive)
docker system prune -a -f

# Update containers (after code changes)
docker compose build --no-cache
docker compose up -d
```

### 11.2 Monitoring Commands
```bash
# Monitor logs continuously
docker compose logs -f

# Monitor specific service
docker compose logs -f api

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### 11.3 Backup and Restore
```bash
# Create backup
docker compose exec postgres pg_dump -U postgres ip_management > backup.sql

# Restore backup
docker compose exec -T postgres psql -U postgres ip_management < backup.sql
```

---

## ✅ Success Checklist

After completing this guide, verify:

- [ ] All containers are running: `docker compose ps`
- [ ] Frontend accessible: http://localhost:3000
- [ ] API accessible: http://localhost:8000/api/docs
- [ ] Health check passes: http://localhost:8000/health
- [ ] Database contains sample data
- [ ] No error messages in logs: `docker compose logs`
- [ ] Resource usage is acceptable: `docker stats`

## 🆘 Emergency Recovery

If something goes wrong:

```bash
# Nuclear option - complete reset
docker compose down -v
docker system prune -a -f --volumes
docker compose build --no-cache
docker compose up -d
docker compose exec api python scripts/init-sample-data.py
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs: `docker compose logs -f [service]`
3. Verify configuration: `docker compose config`
4. Check system resources: `docker system df`
5. Try the emergency recovery procedure

The system should now be fully operational and ready for industrial network management at facilities like the Bosch Rexroth Bursa Factory.