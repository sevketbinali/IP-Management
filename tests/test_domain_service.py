"""
Comprehensive tests for Domain Service functionality.

Tests domain creation, validation, and management according to 
Bosch Rexroth IT/OT network standards.
"""

import pytest
import asyncio
from uuid import uuid4
from sqlalchemy.exc import IntegrityError

from src.ip_management.services.ip_service import IPManagementService
from src.ip_management.models.schemas import DomainCreate, DomainUpdate
from src.ip_management.models.exceptions import VLANConfigurationError


class TestDomainService:
    """Test suite for Domain Service operations."""
    
    @pytest.mark.asyncio
    async def test_create_domain_success(self, ip_service: IPManagementService, sample_domain_data):
        """Test successful domain creation."""
        domain_create = DomainCreate(**sample_domain_data)
        domain = await ip_service.create_domain(domain_create)
        
        assert domain.code == sample_domain_data["code"]
        assert domain.name == sample_domain_data["name"]
        assert domain.description == sample_domain_data["description"]
        assert domain.is_active == sample_domain_data["is_active"]
        assert domain.id is not None
        assert domain.created_at is not None
    
    @pytest.mark.asyncio
    async def test_create_domain_duplicate_code(self, ip_service: IPManagementService, sample_domain_data):
        """Test domain creation with duplicate code fails."""
        domain_create = DomainCreate(**sample_domain_data)
        
        # Create first domain
        await ip_service.create_domain(domain_create)
        
        # Attempt to create duplicate should fail
        with pytest.raises(VLANConfigurationError, match="Domain code 'MFG' already exists"):
            await ip_service.create_domain(domain_create)
    
    @pytest.mark.asyncio
    async def test_create_domain_invalid_code_format(self, ip_service: IPManagementService):
        """Test domain creation with invalid code format."""
        invalid_data = {
            "code": "invalid-code-123",  # Should be uppercase, no special chars
            "name": "Invalid Domain",
            "description": "Test domain with invalid code",
            "is_active": True
        }
        
        domain_create = DomainCreate(**invalid_data)
        
        with pytest.raises(VLANConfigurationError):
            await ip_service.create_domain(domain_create)
    
    @pytest.mark.asyncio
    async def test_get_domain_by_id_success(self, ip_service: IPManagementService, sample_domain_data):
        """Test retrieving domain by ID."""
        domain_create = DomainCreate(**sample_domain_data)
        created_domain = await ip_service.create_domain(domain_create)
        
        retrieved_domain = await ip_service.get_domain_by_id(created_domain.id)
        
        assert retrieved_domain.id == created_domain.id
        assert retrieved_domain.code == created_domain.code
        assert retrieved_domain.name == created_domain.name
    
    @pytest.mark.asyncio
    async def test_get_domain_by_id_not_found(self, ip_service: IPManagementService):
        """Test retrieving non-existent domain."""
        non_existent_id = uuid4()
        
        domain = await ip_service.get_domain_by_id(non_existent_id)
        assert domain is None
    
    @pytest.mark.asyncio
    async def test_get_domain_by_code_success(self, ip_service: IPManagementService, sample_domain_data):
        """Test retrieving domain by code."""
        domain_create = DomainCreate(**sample_domain_data)
        created_domain = await ip_service.create_domain(domain_create)
        
        retrieved_domain = await ip_service.get_domain_by_code(sample_domain_data["code"])
        
        assert retrieved_domain.id == created_domain.id
        assert retrieved_domain.code == sample_domain_data["code"]
    
    @pytest.mark.asyncio
    async def test_list_domains_empty(self, ip_service: IPManagementService):
        """Test listing domains when none exist."""
        domains = await ip_service.list_domains()
        assert len(domains) == 0
    
    @pytest.mark.asyncio
    async def test_list_domains_multiple(self, ip_service: IPManagementService):
        """Test listing multiple domains."""
        domains_data = [
            {"code": "MFG", "name": "Manufacturing", "description": "Manufacturing domain", "is_active": True},
            {"code": "LOG", "name": "Logistics", "description": "Logistics domain", "is_active": True},
            {"code": "FCM", "name": "Facility", "description": "Facility domain", "is_active": False}
        ]
        
        created_domains = []
        for domain_data in domains_data:
            domain_create = DomainCreate(**domain_data)
            domain = await ip_service.create_domain(domain_create)
            created_domains.append(domain)
        
        # Test listing all domains
        all_domains = await ip_service.list_domains()
        assert len(all_domains) == 3
        
        # Test listing only active domains
        active_domains = await ip_service.list_domains(active_only=True)
        assert len(active_domains) == 2
        
        # Verify active domains are correct
        active_codes = {d.code for d in active_domains}
        assert active_codes == {"MFG", "LOG"}
    
    @pytest.mark.asyncio
    async def test_update_domain_success(self, ip_service: IPManagementService, sample_domain_data):
        """Test successful domain update."""
        domain_create = DomainCreate(**sample_domain_data)
        created_domain = await ip_service.create_domain(domain_create)
        
        update_data = DomainUpdate(
            name="Updated Manufacturing",
            description="Updated description for manufacturing domain",
            is_active=False
        )
        
        updated_domain = await ip_service.update_domain(created_domain.id, update_data)
        
        assert updated_domain.id == created_domain.id
        assert updated_domain.code == created_domain.code  # Code should not change
        assert updated_domain.name == "Updated Manufacturing"
        assert updated_domain.description == "Updated description for manufacturing domain"
        assert updated_domain.is_active == False
        assert updated_domain.updated_at is not None
    
    @pytest.mark.asyncio
    async def test_update_domain_not_found(self, ip_service: IPManagementService):
        """Test updating non-existent domain."""
        non_existent_id = uuid4()
        update_data = DomainUpdate(name="Updated Name")
        
        with pytest.raises(VLANConfigurationError, match="Domain not found"):
            await ip_service.update_domain(non_existent_id, update_data)
    
    @pytest.mark.asyncio
    async def test_delete_domain_success(self, ip_service: IPManagementService, sample_domain_data):
        """Test successful domain deletion."""
        domain_create = DomainCreate(**sample_domain_data)
        created_domain = await ip_service.create_domain(domain_create)
        
        # Delete domain
        success = await ip_service.delete_domain(created_domain.id)
        assert success == True
        
        # Verify domain is deleted
        deleted_domain = await ip_service.get_domain_by_id(created_domain.id)
        assert deleted_domain is None
    
    @pytest.mark.asyncio
    async def test_delete_domain_not_found(self, ip_service: IPManagementService):
        """Test deleting non-existent domain."""
        non_existent_id = uuid4()
        
        with pytest.raises(VLANConfigurationError, match="Domain not found"):
            await ip_service.delete_domain(non_existent_id)
    
    @pytest.mark.asyncio
    async def test_delete_domain_with_value_streams(self, ip_service: IPManagementService, populated_database):
        """Test deleting domain that has value streams should fail."""
        domain = populated_database["domain"]
        
        with pytest.raises(VLANConfigurationError, match="Cannot delete domain with existing value streams"):
            await ip_service.delete_domain(domain.id)
    
    @pytest.mark.asyncio
    async def test_domain_code_validation(self, ip_service: IPManagementService):
        """Test domain code validation rules."""
        invalid_codes = [
            "",  # Empty
            "a",  # Too short
            "TOOLONGCODE",  # Too long
            "MF-G",  # Special characters
            "mfg",  # Lowercase
            "123",  # Numbers only
        ]
        
        for invalid_code in invalid_codes:
            domain_data = {
                "code": invalid_code,
                "name": "Test Domain",
                "description": "Test description",
                "is_active": True
            }
            
            with pytest.raises((VLANConfigurationError, ValueError)):
                domain_create = DomainCreate(**domain_data)
                await ip_service.create_domain(domain_create)
    
    @pytest.mark.asyncio
    async def test_concurrent_domain_creation(self, ip_service: IPManagementService):
        """Test concurrent domain creation with same code."""
        domain_data = {
            "code": "TEST",
            "name": "Test Domain",
            "description": "Test concurrent creation",
            "is_active": True
        }
        
        # Create multiple concurrent tasks
        tasks = []
        for i in range(5):
            domain_create = DomainCreate(**domain_data)
            task = asyncio.create_task(ip_service.create_domain(domain_create))
            tasks.append(task)
        
        # Only one should succeed, others should fail
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for r in results if not isinstance(r, Exception))
        error_count = sum(1 for r in results if isinstance(r, Exception))
        
        assert success_count == 1
        assert error_count == 4