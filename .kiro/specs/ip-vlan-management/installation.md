IP Management & VLAN Segmentation System - Complete Setup Guide
Enterprise IP address management for IT/OT industrial environments

This guide will walk you through setting up and running the IP Management system from scratch on a clean system.

1. Prerequisites
System Requirements
Operating System: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)
RAM: Minimum 8GB (16GB recommended for development)
Storage: At least 5GB free space
Network: Internet connection for downloading dependencies
Required Software
1.1 Python 3.11+
Windows:

# Download from https://www.python.org/downloads/
# Or using Chocolatey
choco install python311

# Verify installation
python --version
macOS:

# Using Homebrew
brew install python@3.11

# Verify installation
python3 --version
Linux (Ubuntu/Debian):

# Update package list
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip

# Verify installation
python3.11 --version
1.2 Node.js 18+ and npm
Windows:

# Download from https://nodejs.org/
# Or using Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
macOS:

# Using Homebrew
brew install node@18

# Verify installation
node --version
npm --version
Linux:

# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
1.3 PostgreSQL 15+
Windows:

# Download from https://www.postgresql.org/download/windows/
# Or using Chocolatey
choco install postgresql15

# Start PostgreSQL service
net start postgresql-x64-15
macOS:

# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
Linux:

# Install PostgreSQL
sudo apt install postgresql-15 postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
1.4 Docker and Docker Compose (Optional but Recommended)
Windows:

# Download Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or using Chocolatey
choco install docker-desktop
macOS:

# Download Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or using Homebrew
brew install --cask docker
Linux:

# Install Docker
sudo apt install docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Log out and back in for group changes to take effect
1.5 Git
Windows:

# Download from https://git-scm.com/download/win
# Or using Chocolatey
choco install git
macOS:

# Using Homebrew
brew install git
Linux:

sudo apt install git
2. Setup Instructions
2.1 Clone the Repository
# Clone the project
git clone https://github.com/your-org/ip-management.git
cd ip-management

# Verify project structure
ls -la
2.2 Backend Setup
Install UV Package Manager (Recommended)
# Install UV for fast Python package management
pip install uv

# Verify installation
uv --version
Set Up Python Environment
# Create and activate virtual environment using UV
uv venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
uv sync

# Alternative: Using pip
# pip install -r requirements.txt
Configure Environment Variables
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# Windows: notepad .env
# macOS/Linux: nano .env
Required .env Configuration:

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ip_management
DB_PASSWORD=your_secure_password

# Application Settings
SECRET_KEY=your-32-character-secret-key-here
DEBUG=false
LOG_LEVEL=INFO

# Bosch Rexroth Settings
PLANT_CODE=BURSA
ORGANIZATION=Bosch Rexroth
Set Up Database
# Create PostgreSQL database
# Connect to PostgreSQL as superuser
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE ip_management;
CREATE USER ip_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ip_management TO ip_user;
\q

# Run database migrations
alembic upgrade head
2.3 Frontend Setup
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0

# Return to project root
cd ..
3. Running the Application
You have three options to run the application:

Option A: Docker Compose (Recommended for Production)
Start All Services
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
Initialize Sample Data
# Create sample data for Bosch Rexroth factory
docker-compose exec api python scripts/init-sample-data.py
Stop Services
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose down -v
Option B: Development Mode (Recommended for Development)
Terminal 1 - Start Backend
# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# Start development server with hot reload
python scripts/run_dev.py

# Alternative: Direct uvicorn command
# uvicorn src.ip_management.api.main:app --host 0.0.0.0 --port 8000 --reload
Terminal 2 - Start Frontend
# Navigate to frontend directory
cd frontend

# Start React development server
npm run dev

# Alternative: Using yarn
# yarn dev
Terminal 3 - Initialize Sample Data (Optional)
# Activate virtual environment
source .venv/bin/activate

# Create sample data
python scripts/init-sample-data.py
Option C: Production Mode
Build and Start Backend
# Activate virtual environment
source .venv/bin/activate

# Start production server
uvicorn src.ip_management.api.main:app --host 0.0.0.0 --port 8000 --workers 4
Build and Serve Frontend
cd frontend

# Build production bundle
npm run build

# Serve using a static server (install if needed)
npm install -g serve
serve -s dist -l 3000
4. Usage Notes
4.1 Accessing the Application
Once running, access the application at:

Frontend (Web Interface):

Development: http://localhost:3000
Production: http://localhost:3000 (or configured port)
Backend API:

API Base URL: http://localhost:8000/api/v1
Interactive API Docs (Swagger): http://localhost:8000/api/docs
Alternative API Docs (ReDoc): http://localhost:8000/api/redoc
Health Check: http://localhost:8000/health
Database:

PostgreSQL: localhost:5432
Database Name: ip_management
4.2 Default Login/Access
The system doesn't require authentication by default. Access the web interface directly at http://localhost:3000.

4.3 Key Features Available
Domain Management: Create and manage business domains (MFG, LOG, FCM, ENG)
Value Stream Management: Manage production lines and operational areas
Zone Management: Configure security zones with proper classifications
VLAN Management: Create VLANs with automatic IP calculation
IP Assignment: Assign IP addresses to devices with validation
Reports: View network hierarchy and security compliance reports
4.4 Sample Data
If you ran the sample data script, you'll have:

4 Domains (MFG, LOG, FCM, ENG)
10 Value Streams (A2, A4, A6, A10, MCO, LOG21, etc.)
13 Security Zones with proper classifications
13 VLANs with realistic network segments
15 IP assignments for various industrial devices
5. Troubleshooting
Common Issues and Solutions
Database Connection Issues
# Check PostgreSQL is running
# Windows: net start postgresql-x64-15
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Test database connection
psql -U postgres -d ip_management -c "SELECT version();"
Port Conflicts
# Check if ports are in use
# Windows: netstat -an | findstr :8000
# macOS/Linux: lsof -i :8000

# Kill processes using the port
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
Python Dependencies Issues
# Clear and reinstall dependencies
rm -rf .venv
uv venv
source .venv/bin/activate
uv sync
Node.js Dependencies Issues
cd frontend
rm -rf node_modules package-lock.json
npm install
Docker Issues
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View detailed logs
docker-compose logs api
docker-compose logs frontend
Getting Help
Check the logs for detailed error messages
Verify all prerequisites are installed correctly
Ensure environment variables are set properly
Check that all required ports are available
Review the project documentation in the docs/ directory
6. Development Commands
Backend Development
# Run tests
pytest tests/ -v --cov=src

# Code formatting
ruff format src/
ruff check src/

# Type checking
mypy src/

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
Frontend Development


cd frontend

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build