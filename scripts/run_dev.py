#!/usr/bin/env python3
"""
Development server runner for IP Management System.

Provides hot-reload development server with proper database initialization
and environment setup for local development.
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from src.ip_management.config.database import create_tables
from src.ip_management.config.settings import settings


async def setup_database():
    """Initialize database tables for development."""
    print("🔧 Setting up database...")
    try:
        create_tables()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False
    return True


def run_migrations():
    """Run Alembic migrations."""
    print("🔄 Running database migrations...")
    try:
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("✅ Migrations completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        return False
    except FileNotFoundError:
        print("⚠️  Alembic not found, skipping migrations")
    return True


def start_dev_server():
    """Start the development server with hot reload."""
    print("🚀 Starting development server...")
    print(f"📍 API will be available at: http://localhost:8000")
    print(f"📖 API docs will be available at: http://localhost:8000/api/docs")
    print("🔥 Hot reload enabled - server will restart on code changes")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([
            "uvicorn",
            "src.ip_management.api.main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--reload-dir", "src",
            "--log-level", "info"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Development server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")


async def main():
    """Main development setup and server startup."""
    print("🏭 IP Management & VLAN Segmentation System")
    print("🏢 Bosch Rexroth - Bursa Factory")
    print("=" * 50)
    
    # Check environment
    if not os.getenv("DATABASE_URL"):
        print("⚠️  DATABASE_URL not set, using default SQLite for development")
    
    # Setup database
    if not await setup_database():
        sys.exit(1)
    
    # Run migrations
    if not run_migrations():
        print("⚠️  Continuing without migrations...")
    
    # Start server
    start_dev_server()


if __name__ == "__main__":
    asyncio.run(main())