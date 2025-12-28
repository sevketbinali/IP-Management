# IP Management System - Docker-Only Deployment Guide

**Complete containerized deployment for IT/OT industrial environments**

This guide provides step-by-step instructions to run the entire IP Management & VLAN Segmentation System using **only Docker and Docker Compose**. No local Python, Node.js, or other dependencies are required.

## 📋 Prerequisites

### Required Software
The **ONLY** requirements are:
- **Docker Engine** 20.10+ 
- **Docker Compose** 2.0+

### Verify Docker Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version  
docker compose version
# Expected: Docker Compose version 2.0.0 or higher

# Verify Docker is running
docker info
# Should show system information without errors
```

### Install Docker (if needed)

**Windows:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or using Chocolatey:
choco install docker-desktop
```

**macOS:**
```bash
# Download Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or using Homebrew:
brew install --cask docker
```

**Linux (Ubuntu/Debian):**
```bash
# Install Docker Engine
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Log out and back in for group changes
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/ip-management.git
cd ip-management
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional - defaults work for development)
nano .env  # or use your preferred editor
```

### 3. Build and Start Services
```bash
# Build all containers
docker compose build

# Start all services in background
docker compose up -d

# View startup logs
docker compose logs -f
```

**Note**: The frontend uses a simple static HTML interface for maximum compatibility. If you prefer the React version, you can switch the Dockerfile in docker-compose.yml from `Dockerfile.simple` to `Dockerfile.frontend`.

### 4. Initialize Sample Data (Optional)
```bash
# Wait for services to be healthy (30-60 seconds)
docker compose ps

# Create sample Bosch Rexroth factory data
docker compose exec api python scripts/init-sample-data.py
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
ip-management/
├── docker-compose.yml          # Main orchestration file
├── Dockerfile.backend          # Backend container definition
├── .env.example               # Environment template
├── .env                       # Your configuration (create from example)
├── frontend/
│   ├── Dockerfile.frontend    # Frontend container definition
│   ├── nginx.conf            # Frontend web server config
│   └── docker-entrypoint.sh  # Runtime configuration script
├── nginx/
│   └── nginx.conf            # Reverse proxy config (production)
├── scripts/
│   └── init-db.sql           # Database initialization
└── src/                      # Backend source code
```

## ⚙️ Configuration

### Environment Variables (.env)

Copy `.env.example` to `.env` and customize:

```bash
# Database Configuration
POSTGRES_PASSWORD=your_secure_password_here

# Application Security
SECRET_KEY=your-32-character-secret-key-change-in-production

# Port Mappings (change if ports are in use)
API_PORT=8000          # Backend API
FRONTEND_PORT=3000     # Frontend web interface
POSTGRES_PORT=5432     # Database (usually keep default)

# Bosch Rexroth Configuration
PLANT_CODE=BURSA
ORGANIZATION=Bosch Rexroth

# Frontend API Connection
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Key Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | `secure_password_change_in_production` |
| `SECRET_KEY` | Application secret key | Must be changed for production |
| `API_PORT` | Backend API port | `8000` |
| `FRONTEND_PORT` | Frontend web port | `3000` |
| `PLANT_CODE` | Factory identifier | `BURSA` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

## 🐳 Docker Commands

### Build and Start
```bash
# Build all containers (run after code changes)
docker compose build

# Build specific service
docker compose build api
docker compose build frontend

# Start all services
docker compose up -d

# Start with logs visible
docker compose up

# Start specific services
docker compose up -d postgres redis
```

### Monitor and Debug
```bash
# Check service status
docker compose ps

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres

# Follow logs with timestamps
docker compose logs -f -t api
```

### Container Management
```bash
# Stop all services
docker compose stop

# Stop specific service
docker compose stop api

# Restart all services
docker compose restart

# Restart specific service
docker compose restart api

# Remove containers (keeps volumes)
docker compose down

# Remove containers and volumes (⚠️ DELETES DATA)
docker compose down -v
```

### Shell Access
```bash
# Access backend container
docker compose exec api /bin/bash

# Access frontend container  
docker compose exec frontend /bin/sh

# Access database
docker compose exec postgres psql -U postgres -d ip_management

# Run one-off commands
docker compose exec api python scripts/init-sample-data.py
docker compose exec api alembic upgrade head
```

## 📊 Service Details

### Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| `postgres` | 5432 | PostgreSQL database | `pg_isready` |
| `redis` | 6379 | Cache and sessions | `redis-cli ping` |
| `api` | 8000 | FastAPI backend | `curl /health` |
| `frontend` | 3000 | React web interface | `curl /` |
| `nginx` | 80/443 | Reverse proxy (production) | `curl /health` |

### Health Checks
```bash
# Check all service health
docker compose ps

# Manual health checks
curl http://localhost:8000/health  # Backend
curl http://localhost:3000/        # Frontend

# Database connection test
docker compose exec postgres pg_isready -U postgres
```

## 💾 Data Persistence

### Volumes
```bash
# List Docker volumes
docker volume ls

# Inspect volume details
docker volume inspect ip-management_postgres_data

# Backup database
docker compose exec postgres pg_dump -U postgres ip_management > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres ip_management < backup.sql
```

### Data Locations
- **Database**: `postgres_data` volume
- **Redis Cache**: `redis_data` volume  
- **API Logs**: `api_logs` volume
- **Nginx Logs**: `nginx_logs` volume

### Reset Data
```bash
# ⚠️ WARNING: This deletes ALL data
docker compose down -v
docker compose up -d

# Recreate sample data
docker compose exec api python scripts/init-sample-data.py
```

## 🔧 Development Workflow

### Code Changes
```bash
# After backend code changes
docker compose build api
docker compose restart api

# After frontend code changes  
docker compose build frontend
docker compose restart frontend

# Rebuild everything
docker compose build --no-cache
docker compose up -d
```

### Database Migrations
```bash
# Create new migration
docker compose exec api alembic revision --autogenerate -m "Description"

# Apply migrations
docker compose exec api alembic upgrade head

# Check migration status
docker compose exec api alembic current
```

### Running Tests
```bash
# Backend tests
docker compose exec api pytest tests/ -v

# With coverage
docker compose exec api pytest tests/ --cov=src --cov-report=html
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
# Windows: netstat -an | findstr :8000
# macOS/Linux: lsof -i :8000

# Change ports in .env file
API_PORT=8001
FRONTEND_PORT=3001
```

#### Container Won't Start
```bash
# Check container logs
docker compose logs api

# Check system resources
docker system df
docker system prune -f

# If UV package manager issues occur, use simple Dockerfile
# Edit docker-compose.yml and change:
# dockerfile: Dockerfile.backend.simple

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

#### UV Package Manager Issues
```bash
# If you encounter UV-related build errors, switch to standard pip
# Edit docker-compose.yml:
sed -i 's/Dockerfile.backend/Dockerfile.backend.simple/g' docker-compose.yml

# Or manually edit docker-compose.yml and change the dockerfile line to:
# dockerfile: Dockerfile.backend.simple

# Then rebuild
docker compose build --no-cache api
docker compose up -d
```

#### Database Connection Issues
```bash
# Check database is running
docker compose ps postgres

# Test database connection
docker compose exec postgres pg_isready -U postgres

# Check database logs
docker compose logs postgres

# Reset database
docker compose stop postgres
docker volume rm ip-management_postgres_data
docker compose up -d postgres
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker compose logs frontend

# Verify API connection
curl http://localhost:8000/health

# Check environment variables
docker compose exec frontend env | grep REACT_APP
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Limit container resources (add to docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

### Clean Up
```bash
# Remove unused containers, networks, images
docker system prune -f

# Remove everything (⚠️ NUCLEAR OPTION)
docker system prune -a -f --volumes
```

## 🔒 Production Deployment

### Security Checklist
- [ ] Change default passwords in `.env`
- [ ] Generate secure `SECRET_KEY` (32+ characters)
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable container resource limits

### Production Profile
```bash
# Start with production profile (includes nginx proxy)
docker compose --profile production up -d

# Access via nginx proxy
curl http://localhost:80/health
```

### SSL Configuration
1. Place SSL certificates in `nginx/ssl/`
2. Uncomment HTTPS server block in `nginx/nginx.conf`
3. Update `CORS_ORIGINS` in `.env`

## 📞 Support

### Getting Help
1. Check service logs: `docker compose logs -f [service]`
2. Verify configuration: `docker compose config`
3. Check system resources: `docker system df`
4. Review environment variables: `docker compose exec api env`

### Useful Commands Reference
```bash
# Quick status check
docker compose ps && docker compose logs --tail=10 api

# Full system restart
docker compose down && docker compose up -d

# Emergency reset (⚠️ deletes data)
docker compose down -v && docker system prune -f && docker compose up -d

# Performance monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🎉 Success!

If everything is working correctly, you should see:

✅ **Frontend**: http://localhost:3000 - IP Management web interface  
✅ **API Docs**: http://localhost:8000/api/docs - Interactive API documentation  
✅ **Health Check**: http://localhost:8000/health - Returns "healthy"  

The system is now ready for managing IT/OT network infrastructure at industrial facilities like the Bosch Rexroth Bursa Factory.

**No local Python, Node.js, or other dependencies required - everything runs in Docker containers!**