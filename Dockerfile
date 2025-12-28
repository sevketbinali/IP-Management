# Multi-stage Dockerfile for IP Management System
# Optimized for production deployment in industrial environments

# Development stage
FROM python:3.11-slim as development

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./
COPY requirements.txt* ./

# Install Python dependencies
RUN uv pip install --system -r pyproject.toml

# Copy source code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Development command
CMD ["uvicorn", "src.ip_management.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM python:3.11-slim as production

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./

# Install Python dependencies (production only)
RUN uv pip install --system --no-dev .

# Copy source code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command
CMD ["uvicorn", "src.ip_management.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]