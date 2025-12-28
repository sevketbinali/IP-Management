"""
Application settings and configuration.

Environment-based configuration for different deployment scenarios
(development, staging, production).
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "IP Management & VLAN Segmentation System"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://postgres:password@localhost:5432/ip_management"
    database_echo: bool = False
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    allowed_hosts: List[str] = ["localhost", "127.0.0.1", "*.bosch.com", "*.rexroth.com"]
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Network Configuration
    default_reserved_start_ips: int = 6
    default_reserved_end_ips: int = 1
    max_vlan_id: int = 4094
    min_vlan_id: int = 1
    
    # Performance
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_recycle: int = 3600
    
    # Bosch Rexroth Specific
    plant_code: str = "BURSA"
    organization: str = "Bosch Rexroth"
    security_compliance_check_days: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()