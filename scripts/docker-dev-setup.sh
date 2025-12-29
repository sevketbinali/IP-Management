#!/bin/bash
# Docker Development Setup Script
# Helps with npm install and development tasks in Docker

set -e

echo "🐳 IP Management Docker Development Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running ✓"

# Function to run npm install in container
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    # Method 1: Using temporary container
    docker run --rm \
        -v "$(pwd)/frontend:/app" \
        -v "frontend_node_modules:/app/node_modules" \
        -w /app \
        node:18-alpine \
        npm install
    
    print_success "Frontend dependencies installed!"
}

# Function to start development environment
start_dev_environment() {
    print_status "Starting development environment..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.dev.yml down
    
    # Start development containers
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
}

# Function to run commands in frontend container
run_frontend_command() {
    local command="$1"
    print_status "Running: $command"
    
    docker run --rm \
        -v "$(pwd)/frontend:/app" \
        -v "frontend_node_modules:/app/node_modules" \
        -w /app \
        -p 3000:3000 \
        node:18-alpine \
        sh -c "$command"
}

# Function to enter frontend container shell
enter_frontend_shell() {
    print_status "Entering frontend container shell..."
    
    docker run --rm -it \
        -v "$(pwd)/frontend:/app" \
        -v "frontend_node_modules:/app/node_modules" \
        -w /app \
        node:18-alpine \
        sh
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Install frontend dependencies (npm install)"
    echo "2) Start development environment"
    echo "3) Run custom npm command"
    echo "4) Enter frontend container shell"
    echo "5) View running containers"
    echo "6) Stop all containers"
    echo "7) Clean up (remove containers and volumes)"
    echo "0) Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-7]: " choice
    
    case $choice in
        1)
            install_frontend_deps
            ;;
        2)
            start_dev_environment
            ;;
        3)
            read -p "Enter npm command (e.g., 'npm run build'): " npm_cmd
            run_frontend_command "$npm_cmd"
            ;;
        4)
            enter_frontend_shell
            ;;
        5)
            print_status "Running containers:"
            docker ps
            ;;
        6)
            print_status "Stopping all containers..."
            docker-compose -f docker-compose.dev.yml down
            docker-compose down
            print_success "All containers stopped!"
            ;;
        7)
            print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
            read -p "" confirm
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                docker-compose -f docker-compose.dev.yml down -v
                docker-compose down -v
                docker volume prune -f
                print_success "Cleanup completed!"
            fi
            ;;
        0)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            ;;
    esac
done