"""
Pytest configuration and fixtures for IP Management System tests.

Provides database fixtures, test clients, and mock data for comprehensive testing
of industrial network management functionality.
"""

import pytest
import asyncio
from typing import Generator, AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from src.ip_management.models.database import Base
from src.ip_management.api.main import app
from src.ip_management.config.database import get_db
from src.ip_management.services.ip_service import IPManagementService

# Test database URL (SQLite for testing)
TEST_DATABASE_URL = "sqlite:///./test_ip_management.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def test_client(db_session: Session) -> TestClient:
    """Create a test client with database dependency override."""
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def ip_service(db_session: Session) -> IPManagementService:
    """Create IP management service instance for testing."""
    return IPManagementService(db_session)


@pytest.fixture
def sample_domain_data():
    """Sample domain data for testing."""
    return {
        "code": "MFG",
        "name": "Manufacturing",
        "description": "Manufacturing domain for production lines",
        "is_active": True
    }


@pytest.fixture
def sample_value_stream_data():
    """Sample value stream data for testing."""
    return {
        "code": "A2",
        "name": "Assembly Line A2",
        "description": "Main assembly line for hydraulic components",
        "is_active": True
    }


@pytest.fixture
def sample_zone_data():
    """Sample zone data for testing."""
    return {
        "name": "Manufacturing Zone A2",
        "security_type": "MFZ_SL4",
        "zone_manager": "John Doe",
        "description": "Secure manufacturing zone for assembly line A2",
        "is_active": True
    }


@pytest.fixture
def sample_vlan_data():
    """Sample VLAN data for testing."""
    return {
        "vlan_id": 100,
        "subnet": "192.168.100.0",
        "netmask": "255.255.255.0",
        "description": "Test VLAN for manufacturing zone",
        "is_active": True
    }


@pytest.fixture
def sample_ip_assignment_data():
    """Sample IP assignment data for testing."""
    return {
        "ip_address": "192.168.100.10",
        "mac_address": "00:11:22:33:44:55",
        "ci_name": "PLC-A2-001",
        "description": "Main PLC for assembly line A2",
        "is_active": True
    }


@pytest.fixture
async def populated_database(
    ip_service: IPManagementService,
    sample_domain_data,
    sample_value_stream_data,
    sample_zone_data,
    sample_vlan_data
):
    """Create a populated database with sample data for integration tests."""
    # Create domain
    domain = await ip_service.create_domain(sample_domain_data)
    
    # Create value stream
    vs_data = {**sample_value_stream_data, "domain_id": domain.id}
    value_stream = await ip_service.create_value_stream(vs_data)
    
    # Create zone
    zone_data = {**sample_zone_data, "value_stream_id": value_stream.id}
    zone = await ip_service.create_zone(zone_data)
    
    # Create VLAN
    vlan_data = {**sample_vlan_data, "zone_id": zone.id}
    vlan = await ip_service.create_vlan(vlan_data)
    
    return {
        "domain": domain,
        "value_stream": value_stream,
        "zone": zone,
        "vlan": vlan
    }