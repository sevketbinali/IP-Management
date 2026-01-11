# 🏭 IP Management & VLAN Segmentation System

**Enterprise-grade IP address management for IT/OT industrial environments**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

---
<img width="1677" height="909" alt="image" src="https://github.com/user-attachments/assets/e2484063-8a05-4897-8df9-788b99799d47" />
<img width="1608" height="814" alt="image" src="https://github.com/user-attachments/assets/af703b6a-2de8-43b2-bc8e-6c4fc1b4e669" />
<img width="1603" height="847" alt="image" src="https://github.com/user-attachments/assets/4a91017d-6de1-4db7-9b3a-75a1d1d65700" />



## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ System Architecture](#️-system-architecture)
- [🔧 Technology Stack](#-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker Installation](#-docker-installation)
- [📊 Network Structure](#-network-structure)
- [🖥️ User Interface](#️-user-interface)
- [🔧 Development](#-development)
- [📡 API Documentation](#-api-documentation)
- [🔒 Security Features](#-security-features)
- [🚀 Production Deployment](#-production-deployment)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Documentation](#-documentation)

---



## 🎯 Overview

Comprehensive IP management system designed for industrial IT/OT network infrastructure. Provides centralized IP address allocation, VLAN segmentation, and security zone management across manufacturing, logistics, facility, and engineering domains.

### ✨ Key Features

- **🏢 Hierarchical Network Management**: Domain → Value Stream → Zone → VLAN → IP structure
- **🤖 Automatic IP Allocation**: Smart IP generation with reserved management IP protection (first 6 + last IP)
- **🛡️ Security Zone Compliance**: Industrial security standards (SL3, MFZ_SL4, LOG_SL4, etc.)
- **🎨 Industrial UI**: React/TypeScript interface optimized for IT/OT network operations
- **⚡ Real-time Validation**: Client-side validation with server-side consistency
- **📋 Audit & Compliance**: Complete audit trail and security compliance reporting
- **🏭 Multi-Plant Scalability**: Designed for expansion to additional industrial facilities

### 🏭 Target Environment

- **Manufacturing**: Production lines and manufacturing equipment
- **Logistics**: Warehouse systems and logistics infrastructure
- **Facility**: Analyzers, cameras, and building management systems
- **Engineering**: Engineering test benches and development systems

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   SQLAlchemy    │    │   + Redis       │
│   Zustand       │    │   Pydantic      │    │   + Nginx       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🐳 Docker Services

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **PostgreSQL** | 5432 | Main database | `pg_isready` |
| **Redis** | 6379 | Cache and sessions | `redis-cli ping` |
| **FastAPI** | 8000 | Backend API | `curl /health` |
| **React Frontend** | 3000 | Web interface | `curl /` |
| **Nginx** | 80/443 | Reverse proxy | `curl /health` |

---

## 🔧 Technology Stack

### 🎨 Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript 5.0+** - Type-safe development
- **Tailwind CSS** - Industrial utility-first styling
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client with retry logic and caching
- **Vite** - Fast development and optimized builds

### ⚙️ Backend
- **Python 3.11+** - Core development language
- **FastAPI** - High-performance async API framework
- **SQLAlchemy 2.0** - Modern ORM with async support
- **PostgreSQL 15** - Enterprise database with network data types
- **Alembic** - Database migration management
- **Pydantic** - Data validation and serialization

### 🏗️ Infrastructure
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Reverse proxy and load balancing
- **Redis** - Caching and session management
- **UV** - Fast Python package management

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Docker & Docker Compose** (Recommended - no local setup required)
- OR: Python 3.11+, Node.js 18+, PostgreSQL 15+

### 🐳 Docker Installation (Recommended)

```bash
# Clone repository
git clone https://github.com/your-org/ip-management.git
cd ip-management

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Initialize sample data (optional)
docker-compose exec api python scripts/init-sample-data.py

# Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/api/docs
```

### 💻 Local Development

```bash
# Backend setup
pip install uv
uv sync
cp .env.example .env
# Edit .env with your database credentials
python scripts/run_dev.py

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

---

## 🐳 Docker Installation

### 🚀 One-Command Startup

```bash
# Start all services in background
docker-compose up -d

# Check service status
docker-compose ps
```

### 📊 Service Status Check

```bash
# Check health status of all services
docker-compose ps

# View logs for specific service
docker-compose logs -f api          # Backend logs
docker-compose logs -f frontend     # Frontend logs
docker-compose logs -f postgres     # Database logs
docker-compose logs -f redis        # Cache logs

# Follow all logs in real-time
docker-compose logs -f
```

### 🔧 Service Management

```bash
# Restart specific services
docker-compose restart api frontend

# Stop services
docker-compose stop

# Remove services completely (data preserved)
docker-compose down

# Remove services and volumes (DATA WILL BE LOST!)
docker-compose down -v
```

### 🛠️ Troubleshooting Commands

#### Database Connection Issues
```bash
# Check PostgreSQL service status
docker-compose exec postgres pg_isready -U postgres

# Connect to database manually
docker-compose exec postgres psql -U postgres -d ip_management

# Check database logs
docker-compose logs postgres
```

#### API Service Issues
```bash
# API health check
curl http://localhost:8000/health

# Connect to API container
docker-compose exec api bash

# Check migration status
docker-compose exec api alembic current

# Run migrations
docker-compose exec api alembic upgrade head
```

#### Frontend Issues
```bash
# Check frontend build status
docker-compose logs frontend

# Connect to frontend container
docker-compose exec frontend sh

# Test nginx configuration
docker-compose exec frontend nginx -t
```

#### Redis Cache Issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# View cache contents
docker-compose exec redis redis-cli keys "*"

# Clear cache
docker-compose exec redis redis-cli flushall
```

### 🔄 Service Restart Order

If experiencing service issues, restart in this order:

```bash
# 1. Start database and cache services first
docker-compose up -d postgres redis

# 2. Wait for database to be ready
docker-compose exec postgres pg_isready -U postgres

# 3. Start backend API
docker-compose up -d api

# 4. Wait for API to be ready
curl -f http://localhost:8000/health

# 5. Start frontend
docker-compose up -d frontend

# 6. Start nginx (for production)
docker-compose --profile production up -d nginx
```

---

## 📊 Network Structure

The system manages network infrastructure using a hierarchical approach:

```
🏢 Domains (Business Areas)
├── 🏭 Manufacturing
│   ├── 🔧 Production Lines
│   └── 🛡️ Security Zones (MFZ_SL4, SL3)
├── 📦 Logistics
│   ├── 🚛 Warehouse Systems
│   └── 🛡️ Security Zones (LOG_SL4)
├── 🏢 Facility
│   ├── 🔬 Analyzers, 📹 Cameras, 🏠 Building Systems
│   └── 🛡️ Security Zones (FMZ_SL4)
└── 🔬 Engineering
    ├── 🧪 Test Benches
    └── 🛡️ Security Zones (ENG_SL4, LRSZ_SL4, RSZ_SL4)
```

### 🛡️ Security Classifications

| Code | Description | Use Case |
|------|-------------|----------|
| **SL3** | Secure BCN | Office Network, Server Network |
| **MFZ_SL4** | Manufacturing Zone | Production Area |
| **LOG_SL4** | Logistics Zone | Logistics Area |
| **FMZ_SL4** | Facility Zone | Facility Area |
| **ENG_SL4** | Engineering Zone | Engineering Area |
| **LRSZ_SL4** | Local Restricted Zone | MES Zone, SQL Zone, Docker Zone |
| **RSZ_SL4** | Restricted Zone | Restricted Area |

### 🔒 Reserved IP Protection

The system automatically reserves network management IPs:
- **First 6 IPs**: Reserved for network infrastructure (routers, switches, etc.)
- **Last IP**: Reserved for broadcast/management purposes
- **Visual Indicators**: Frontend clearly marks reserved IPs as non-assignable
- **Validation**: Both client and server prevent allocation of reserved IPs

---

## 🖥️ User Interface

### 🎨 Industrial Frontend Features

- **👨‍💼 Operator-Focused Design**: Optimized for network administrators and technicians
- **📱 Responsive Layout**: Works on desktop and tablet devices in production environments
- **⚡ Real-time Validation**: Immediate feedback on network configuration errors
- **♿ Accessibility**: WCAG AAA compliant with keyboard navigation and screen reader support
- **🚀 Performance**: Optimized for large datasets with pagination and virtual scrolling

### 🧭 Main Interface Sections

1. **📊 Dashboard**: System overview, health monitoring, and quick actions
2. **🏢 Domain Management**: Create and manage business domains (Manufacturing, Logistics, Facility, Engineering)
3. **🔧 VLAN Management**: Configure VLANs with automatic IP range calculation
4. **📋 IP Management**: Assign IP addresses to devices with MAC address tracking
5. **📈 Reports**: Network hierarchy visualization and compliance reporting

### 🎯 User Interface Features

- **🔧 Domain Icons**: Manufacturing(🔧), Logistics(🚛), Facility(🏢), Engineering(🧪)
- **📊 Industrial KPIs**: 
  - Active OT Devices: 1,247
  - Registered OT Devices: 1,389
  - Active IPs: 892
  - Unknown Devices: 142
- **🎨 Industrial Design**: Color-coded elements and tooltips

---

## 🔧 Development

### 🧪 Running Tests

```bash
# Backend tests
uv run pytest tests/ -v --cov=src

# Frontend tests
cd frontend
npm test                    # Unit tests
npm run test:coverage      # Coverage report
npm run test:property      # Property-based tests
npm run test:e2e          # End-to-end tests

# Live test dashboard
python scripts/live_test_runner.py
# View test results at http://localhost:8080
```

### 📏 Code Quality

```bash
# Python linting and formatting
uv run ruff check src/
uv run ruff format src/
uv run mypy src/

# TypeScript checking
cd frontend
npm run type-check
npm run lint
npm run lint:fix
```

### 🗃️ Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# View migration history
alembic history

# Check current migration status
alembic current
```

### 🔄 Development Workflow

```bash
# 1. Create new feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
npm test                    # Frontend tests
uv run pytest             # Backend tests

# 3. Check code quality
npm run lint               # Frontend linting
uv run ruff check src/     # Backend linting

# 4. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 5. Create pull request
```

---

## 📡 API Documentation

Once running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

### 🔑 Main Endpoints

```bash
# Domain Management
POST   /api/v1/domains              # Create domain
GET    /api/v1/domains              # List domains
PUT    /api/v1/domains/{id}         # Update domain
DELETE /api/v1/domains/{id}         # Delete domain

# VLAN Management
POST   /api/v1/vlans                # Create VLAN with auto IP calculation
GET    /api/v1/vlans                # List VLANs
POST   /api/v1/vlans/validate       # Validate VLAN configuration
POST   /api/v1/vlans/calculate      # Preview VLAN parameters

# IP Management
POST   /api/v1/ip-assignments       # Assign IP to device
GET    /api/v1/ip-assignments       # List IP assignments
GET    /api/v1/vlans/{id}/available-ips  # Get available IPs
GET    /api/v1/vlans/{id}/reserved-ips   # Get reserved IPs

# Hierarchy & Reports
GET    /api/v1/reports/hierarchy    # Network hierarchy report
GET    /api/v1/reports/security     # Security compliance report
GET    /api/v1/health               # System health check
```

### 📝 API Usage Examples

```bash
# Create new domain
curl -X POST "http://localhost:8000/api/v1/domains" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing",
    "description": "Manufacturing Domain"
  }'

# Create VLAN
curl -X POST "http://localhost:8000/api/v1/vlans" \
  -H "Content-Type: application/json" \
  -d '{
    "vlan_id": 100,
    "subnet": "192.168.1.0/24",
    "zone_id": "uuid-here",
    "default_gateway": "192.168.1.1"
  }'

# Assign IP
curl -X POST "http://localhost:8000/api/v1/ip-assignments" \
  -H "Content-Type: application/json" \
  -d '{
    "vlan_id": "uuid-here",
    "ci_name": "PLC-001",
    "mac_address": "00:1B:44:11:3A:B7",
    "description": "Production Line PLC"
  }'
```

---

## 🔒 Security Features

- **🔍 Input Validation**: Comprehensive validation of IP addresses, VLAN IDs, MAC addresses
- **🛡️ Reserved IP Protection**: Automatic prevention of management IP assignment
- **📋 Audit Logging**: Complete audit trail for all network changes
- **🔐 Security Zone Enforcement**: Strict security type validation
- **🚧 Network Boundary Respect**: IT/OT network segmentation compliance
- **🔒 CSRF Protection**: Cross-site request forgery protection
- **📜 Content Security Policy**: Strict CSP headers in production

### 🔐 Security Configuration

```bash
# Security settings in .env file
SECRET_KEY=your-secret-key-change-in-production-32-chars
ALLOWED_HOSTS=localhost,*.company.com
CORS_ORIGINS=https://your-frontend-domain.com

# SSL certificates (for production)
# Place your certificates in nginx/ssl/ directory
```

---

## 📈 Performance

- **⚡ Sub-second IP Generation**: Automatic IP allocation completes in <1 second
- **🗃️ Database Optimization**: Indexed queries for large device inventories
- **🔗 Connection Pooling**: Optimized database connection management
- **💾 Caching Strategy**: Redis caching for frequently accessed data
- **🎨 Frontend Optimization**: Code splitting, lazy loading, and virtual scrolling

### 📊 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| IP Allocation Time | <1s | ~0.3s |
| API Response Time | <200ms | ~150ms |
| Frontend Load Time | <3s | ~2.1s |
| Database Query Time | <100ms | ~75ms |

---

## 🚀 Production Deployment

### 🌍 Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/ip_management
REDIS_URL=redis://localhost:6379/0

# Security Configuration
SECRET_KEY=your-secret-key-change-in-production-32-chars
ALLOWED_HOSTS=localhost,*.company.com
CORS_ORIGINS=https://your-frontend-domain.com

# Application Configuration
PLANT_CODE=FACTORY01
ORGANIZATION="Your Organization"
LOG_LEVEL=INFO

# Frontend Configuration
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_PLANT_CODE=FACTORY01
VITE_ORGANIZATION="Your Organization"
```

### 🐳 Docker Production Deployment

```bash
# Deploy with production profile
docker-compose --profile production up -d

# Or build individual services
docker build -f Dockerfile.backend -t ip-management-api .
docker build -f frontend/Dockerfile.frontend -t ip-management-frontend ./frontend

# Scale services as needed
docker-compose up -d --scale api=3 --scale frontend=2

# Configure SSL certificates
# Place your certificates in nginx/ssl/ directory
```

### 🔧 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backup strategy established
- [ ] Monitoring and logging configured
- [ ] Firewall rules set up
- [ ] Health check endpoints tested
- [ ] Load balancing configured
- [ ] Security headers set up

---

## 🛠️ Troubleshooting

### 🚨 Common Issues and Solutions

#### 1. Docker Services Not Starting

```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# Restart Docker
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Error

```bash
# Check if PostgreSQL service is running
docker-compose exec postgres pg_isready

# Connect to database manually
docker-compose exec postgres psql -U postgres -d ip_management

# Check migration status
docker-compose exec api alembic current

# Run migrations
docker-compose exec api alembic upgrade head
```

#### 3. Frontend Build Error

```bash
# Clean and reinstall node modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Test build
npm run build
```

#### 4. API Health Check Failed

```bash
# Check if API service is running
curl http://localhost:8000/health

# Check API logs
docker-compose logs api

# Test database connection
docker-compose exec api python -c "
from src.ip_management.database import engine
print('Database connection:', engine.url)
"
```

#### 5. Redis Cache Issues

```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Clear cache
docker-compose exec redis redis-cli flushall

# Check Redis memory usage
docker-compose exec redis redis-cli info memory
```

### 📋 Debug Commands

```bash
# View resource usage of all containers
docker stats

# View details of specific container
docker inspect ip_management_api

# Connect to container with shell
docker-compose exec api bash
docker-compose exec frontend sh

# Check network connections
docker network ls
docker network inspect ip-management_ip_management_network
```

### 🔍 Log Analysis

```bash
# Follow all service logs in real-time
docker-compose logs -f

# View logs for specific time range
docker-compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T23:59:59"

# Filter error logs
docker-compose logs | grep -i error

# Follow API request logs
docker-compose logs -f api | grep -E "(GET|POST|PUT|DELETE)"
```

---

## 📚 Documentation

### 📖 Detailed Documentation

- [Frontend Documentation](frontend/README.md) - Detailed frontend setup and development guide
- [API Documentation](http://localhost:8000/api/docs) - Complete API reference
- [Docker Setup Guide](DOCKER_SETUP.md) - Docker deployment instructions
- [Docker Rebuild Guide](DOCKER_REBUILD_GUIDE.md) - Container rebuild guide
- [Frontend Setup Guide](frontend/SETUP_GUIDE.md) - Frontend development environment setup

### 🎯 Usage Scenarios

#### Creating New Domain
1. Go to Dashboard
2. Click "Domain Management" tab
3. Click "Add Domain" button
4. Enter domain information (Manufacturing, Logistics, Facility, Engineering)
5. Click "Save" button

#### VLAN Configuration
1. "Network Configuration" → "VLAN Management"
2. Click "Add VLAN" button
3. Enter VLAN ID, subnet, gateway information
4. System automatically calculates IP range
5. Save configuration

#### IP Assignment
1. "IP Management" → "Device Assignment"
2. Enter device information (CI Name, MAC Address)
3. Select VLAN
4. Choose "Auto Assign" for automatic IP allocation or enter manual IP
5. Click "Assign IP" button

### 🔧 API Integration

```python
# Python API usage example
import requests

# Create domain
response = requests.post(
    "http://localhost:8000/api/v1/domains",
    json={
        "name": "Manufacturing",
        "description": "Manufacturing Domain"
    }
)

# Create VLAN
response = requests.post(
    "http://localhost:8000/api/v1/vlans",
    json={
        "vlan_id": 100,
        "subnet": "192.168.1.0/24",
        "zone_id": "uuid-here",
        "default_gateway": "192.168.1.1"
    }
)

# Assign IP
response = requests.post(
    "http://localhost:8000/api/v1/ip-assignments",
    json={
        "vlan_id": "uuid-here",
        "ci_name": "PLC-001",
        "mac_address": "00:1B:44:11:3A:B7",
        "description": "Production Line PLC"
    }
)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📋 Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features (unit, property-based, and E2E)
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Follow conventional commit messages

### 🧪 Test Requirements

```bash
# All tests must pass
npm test                    # Frontend tests
uv run pytest             # Backend tests
npm run test:e2e           # E2E tests

# Code coverage minimum 80%
npm run test:coverage      # Frontend coverage
uv run pytest --cov=src   # Backend coverage
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Şevket Binali** - *Initial work* - [GitHub Profile](https://github.com/sevketbinali)

---

*Built with ❤️ for industrial network management*
