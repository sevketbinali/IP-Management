"""
FastAPI application entry point.

Production-ready API with comprehensive error handling, logging,
and security middleware for industrial IT/OT environments.
"""

import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from ..models.exceptions import IPManagementError
from ..config.database import engine, Base
from .routers import domains, value_streams, zones, vlans, ip_assignments, reports

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting IP Management System")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("Shutting down IP Management System")


# Create FastAPI application
app = FastAPI(
    title="IP Management & VLAN Segmentation System",
    description="Enterprise IP address management for IT/OT industrial environments",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.bosch.com", "*.rexroth.com"]
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(IPManagementError)
async def ip_management_exception_handler(request: Request, exc: IPManagementError):
    """Handle custom IP management exceptions."""
    logger.error(f"IP Management Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "IP Management Error",
            "message": str(exc),
            "type": exc.__class__.__name__
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error(f"Validation Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Invalid request data",
            "details": exc.errors()
        }
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    logger.error(f"Database Error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Database Error",
            "message": "An error occurred while processing your request"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unexpected Error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "IP Management System",
        "version": "1.0.0"
    }


# Include API routers
app.include_router(domains.router, prefix="/api/v1", tags=["Domains"])
app.include_router(value_streams.router, prefix="/api/v1", tags=["Value Streams"])
app.include_router(zones.router, prefix="/api/v1", tags=["Zones"])
app.include_router(vlans.router, prefix="/api/v1", tags=["VLANs"])
app.include_router(ip_assignments.router, prefix="/api/v1", tags=["IP Assignments"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with system information."""
    return {
        "message": "IP Management & VLAN Segmentation System",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }