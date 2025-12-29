# Docker Development Setup Script for Windows
# Helps with npm install and development tasks in Docker

param(
    [string]$Action = "menu"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Install frontend dependencies
function Install-FrontendDeps {
    Write-Status "Installing frontend dependencies..."
    
    try {
        docker run --rm `
            -v "${PWD}/frontend:/app" `
            -v "frontend_node_modules:/app/node_modules" `
            -w /app `
            node:18-alpine `
            npm install
        
        Write-Success "Frontend dependencies installed!"
    }
    catch {
        Write-Error "Failed to install dependencies: $_"
    }
}

# Start development environment
function Start-DevEnvironment {
    Write-Status "Starting development environment..."
    
    try {
        # Stop any existing containers
        docker-compose -f docker-compose.dev.yml down
        
        # Start development containers
        docker-compose -f docker-compose.dev.yml up -d
        
        Write-Success "Development environment started!"
        Write-Status "Frontend: http://localhost:3000"
        Write-Status "Backend API: http://localhost:8000"
    }
    catch {
        Write-Error "Failed to start development environment: $_"
    }
}

# Run frontend command
function Invoke-FrontendCommand {
    param([string]$Command)
    
    Write-Status "Running: $Command"
    
    try {
        docker run --rm `
            -v "${PWD}/frontend:/app" `
            -v "frontend_node_modules:/app/node_modules" `
            -w /app `
            -p 3000:3000 `
            node:18-alpine `
            sh -c $Command
    }
    catch {
        Write-Error "Failed to run command: $_"
    }
}

# Enter frontend shell
function Enter-FrontendShell {
    Write-Status "Entering frontend container shell..."
    
    try {
        docker run --rm -it `
            -v "${PWD}/frontend:/app" `
            -v "frontend_node_modules:/app/node_modules" `
            -w /app `
            node:18-alpine `
            sh
    }
    catch {
        Write-Error "Failed to enter shell: $_"
    }
}

# Show running containers
function Show-RunningContainers {
    Write-Status "Running containers:"
    docker ps
}

# Stop all containers
function Stop-AllContainers {
    Write-Status "Stopping all containers..."
    
    try {
        docker-compose -f docker-compose.dev.yml down
        docker-compose down
        Write-Success "All containers stopped!"
    }
    catch {
        Write-Error "Failed to stop containers: $_"
    }
}

# Clean up
function Remove-AllContainers {
    $confirm = Read-Host "This will remove all containers and volumes. Are you sure? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y" -or $confirm -eq "yes" -or $confirm -eq "Yes") {
        try {
            docker-compose -f docker-compose.dev.yml down -v
            docker-compose down -v
            docker volume prune -f
            Write-Success "Cleanup completed!"
        }
        catch {
            Write-Error "Failed to cleanup: $_"
        }
    }
}

# Show menu
function Show-Menu {
    Write-Host ""
    Write-Host "🐳 IP Management Docker Development Setup" -ForegroundColor $Blue
    Write-Host "========================================" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Choose an option:"
    Write-Host "1) Install frontend dependencies (npm install)"
    Write-Host "2) Start development environment"
    Write-Host "3) Run custom npm command"
    Write-Host "4) Enter frontend container shell"
    Write-Host "5) View running containers"
    Write-Host "6) Stop all containers"
    Write-Host "7) Clean up (remove containers and volumes)"
    Write-Host "0) Exit"
    Write-Host ""
}

# Main execution
if (-not (Test-DockerRunning)) {
    Write-Error "Docker is not running. Please start Docker first."
    exit 1
}

Write-Status "Docker is running ✓"

# Handle command line arguments
switch ($Action) {
    "install" { Install-FrontendDeps; exit }
    "start" { Start-DevEnvironment; exit }
    "stop" { Stop-AllContainers; exit }
    "clean" { Remove-AllContainers; exit }
    "shell" { Enter-FrontendShell; exit }
    "ps" { Show-RunningContainers; exit }
}

# Interactive menu
while ($true) {
    Show-Menu
    $choice = Read-Host "Enter your choice [0-7]"
    
    switch ($choice) {
        "1" { Install-FrontendDeps }
        "2" { Start-DevEnvironment }
        "3" { 
            $npmCmd = Read-Host "Enter npm command (e.g., 'npm run build')"
            Invoke-FrontendCommand $npmCmd
        }
        "4" { Enter-FrontendShell }
        "5" { Show-RunningContainers }
        "6" { Stop-AllContainers }
        "7" { Remove-AllContainers }
        "0" { 
            Write-Status "Goodbye!"
            exit 0
        }
        default { Write-Error "Invalid option. Please try again." }
    }
}