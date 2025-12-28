# IP Management & VLAN Segmentation System

**Enterprise-grade IP address management for IT/OT industrial environments**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

## 🏭 Overview

A comprehensive IP management system designed specifically for **Bosch Rexroth Bursa Factory** IT/OT network infrastructure. Provides centralized IP address allocation, VLAN segmentation, and security zone management across manufacturing, logistics, facility, and engineering domains.

### 🎯 Core Features

- **Hierarchical Network Management**: Domain → Value Stream → Zone → VLAN → IP structure
- **Automatic IP Allocation**: Smart IP generation with reserved management IP protection
- **Security Zone Compliance**: Bosch Rexroth security standards (SL3, MFZ_SL4, LOG_SL4, etc.)
- **Industrial-Grade UI**: Optimized for IT/OT network operations
- **Audit & Compliance**: Complete audit trail and security compliance reporting
- **Multi-Plant Scalability**: Designed for expansion to additional Bosch facilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │◄──►│   FastAPI       │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   SQLAlchemy    │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Technology Stack

**Backend:**
- **Python 3.11+** - Core development language
- **FastAPI** - High-performance async API framework
- **SQLAlchemy 2.0** - Modern ORM with async support
- **PostgreSQL 15** - Enterprise database with network data types
- **Alembic** - Database migration management
- **Pydantic** - Data validation and serialization

**Frontend:**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation

**Infrastructure:**
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Reverse proxy and load balancing
- **UV** - Fast Python package management

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/ip-management.git
cd ip-management
```

### 2. Backend Setup

```bash
# Install UV package manager
pip install uv

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
python scripts/run_dev.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Deployment (Alternative)

```bash
# Start all services
docker-compose up -d

# Initialize sample data
docker-compose exec api python scripts/init-sample-data.py
```

## 📊 Network Structure

The system manages network infrastructure using a hierarchical approach:

```
🏢 Domains (Business Areas)
├── 🏭 MFG (Manufacturing)
│   ├── 🔧 A2, A4, A6, A10, MCO (Production Lines)
│   └── 🛡️ Security Zones (MFZ_SL4, SL3)
├── 📦 LOG (Logistics)
│   ├── 🚛 LOG21 (Warehouse Systems)
│   └── 🛡️ Security Zones (LOG_SL4)
├── 🏢 FCM (Facility Management)
│   ├── 🔬 Analyzers, 📹 Cameras, 🏠 Building Systems
│   └── 🛡️ Security Zones (FMZ_SL4)
└── 🔬 ENG (Engineering)
    ├── 🧪 Test Benches
    └── 🛡️ Security Zones (ENG_SL4, LRSZ_SL4, RSZ_SL4)
```

### 🛡️ Security Classifications

- **SL3**: Secure BCN (Office Network, Server Network)
- **MFZ_SL4**: Manufacturing Zone
- **LOG_SL4**: Logistics Zone  
- **FMZ_SL4**: Facility Zone
- **ENG_SL4**: Engineering Zone
- **LRSZ_SL4**: Local Restricted Zone (Nexeed MES, SQL, Docker)
- **RSZ_SL4**: Restricted Zone

## 🔧 Development

### Running Tests

```bash
# Backend tests
uv run pytest tests/ -v --cov=src

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Python linting and formatting
uv run ruff check src/
uv run ruff format src/
uv run mypy src/

# TypeScript checking
cd frontend
npm run type-check
npm run lint
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 📡 API Documentation

Once running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

### Key Endpoints

```
POST   /api/v1/domains              # Create domain
GET    /api/v1/domains              # List domains
POST   /api/v1/value-streams        # Create value stream
POST   /api/v1/zones                # Create zone
POST   /api/v1/vlans                # Create VLAN with auto IP calculation
POST   /api/v1/vlans/calculate      # Preview VLAN parameters
POST   /api/v1/ip-assignments       # Assign IP to device
GET    /api/v1/reports/hierarchy    # Network hierarchy report
GET    /api/v1/reports/security     # Security compliance report
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation of IP addresses, VLAN IDs, MAC addresses
- **Reserved IP Protection**: Automatic prevention of management IP assignment
- **Audit Logging**: Complete audit trail for all network changes
- **Security Zone Enforcement**: Strict security type validation
- **Network Boundary Respect**: IT/OT network segmentation compliance

## 📈 Performance

- **Sub-second IP Generation**: Automatic IP allocation completes in <1 second
- **Database Optimization**: Indexed queries for large device inventories
- **Connection Pooling**: Optimized database connection management
- **Caching Strategy**: Redis caching for frequently accessed data

## 🚀 Deployment

### Production Environment

```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ip_management

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,*.bosch.com,*.rexroth.com

# Application
PLANT_CODE=BURSA
ORGANIZATION="Bosch Rexroth"
LOG_LEVEL=INFO
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Security Guidelines](docs/security.md)
- [Deployment Guide](docs/deployment.md)
- [User Manual](docs/user-manual.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Şevket Binali** - *Initial work* - [GitHub Profile](https://github.com/sevketbinali)

## 🏢 Organization

**Bosch Rexroth Bursa Factory**  
IT/OT Network Infrastructure Management  
Industrial Automation & Control Systems

---

*Built with ❤️ for industrial network management*