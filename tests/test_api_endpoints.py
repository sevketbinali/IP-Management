"""
Comprehensive API endpoint tests for IP Management System.

Tests REST API functionality, authentication, validation, and error handling
according to industrial IT/OT security requirements.
"""

import pytest
import json
from fastapi.testclient import TestClient
from uuid import uuid4

from src.ip_management.models.schemas import DomainCreate, VLANCreate


class TestDomainAPI:
    """Test suite for Domain API endpoints."""
    
    def test_create_domain_success(self, test_client: TestClient, sample_domain_data):
        """Test successful domain creation via API."""
        response = test_client.post("/api/v1/domains", json=sample_domain_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == sample_domain_data["code"]
        assert data["name"] == sample_domain_data["name"]
        assert data["description"] == sample_domain_data["description"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_domain_invalid_data(self, test_client: TestClient):
        """Test domain creation with invalid data."""
        invalid_data = {
            "code": "",  # Empty code
            "name": "Test Domain"
            # Missing required fields
        }
        
        response = test_client.post("/api/v1/domains", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_create_domain_duplicate_code(self, test_client: TestClient, sample_domain_data):
        """Test domain creation with duplicate code."""
        # Create first domain
        response1 = test_client.post("/api/v1/domains", json=sample_domain_data)
        assert response1.status_code == 201
        
        # Attempt duplicate
        response2 = test_client.post("/api/v1/domains", json=sample_domain_data)
        assert response2.status_code == 409  # Conflict
        assert "already exists" in response2.json()["detail"]
    
    def test_get_domain_by_id_success(self, test_client: TestClient, sample_domain_data):
        """Test retrieving domain by ID."""
        # Create domain
        create_response = test_client.post("/api/v1/domains", json=sample_domain_data)
        domain_id = create_response.json()["id"]
        
        # Retrieve domain
        response = test_client.get(f"/api/v1/domains/{domain_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == domain_id
        assert data["code"] == sample_domain_data["code"]
    
    def test_get_domain_by_id_not_found(self, test_client: TestClient):
        """Test retrieving non-existent domain."""
        non_existent_id = str(uuid4())
        response = test_client.get(f"/api/v1/domains/{non_existent_id}")
        assert response.status_code == 404
    
    def test_list_domains_empty(self, test_client: TestClient):
        """Test listing domains when none exist."""
        response = test_client.get("/api/v1/domains")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_domains_with_data(self, test_client: TestClient):
        """Test listing domains with existing data."""
        domains_data = [
            {"code": "MFG", "name": "Manufacturing", "description": "Manufacturing domain", "is_active": True},
            {"code": "LOG", "name": "Logistics", "description": "Logistics domain", "is_active": True}
        ]
        
        # Create domains
        for domain_data in domains_data:
            response = test_client.post("/api/v1/domains", json=domain_data)
            assert response.status_code == 201
        
        # List domains
        response = test_client.get("/api/v1/domains")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2
        codes = {d["code"] for d in data}
        assert codes == {"MFG", "LOG"}
    
    def test_update_domain_success(self, test_client: TestClient, sample_domain_data):
        """Test successful domain update."""
        # Create domain
        create_response = test_client.post("/api/v1/domains", json=sample_domain_data)
        domain_id = create_response.json()["id"]
        
        # Update domain
        update_data = {
            "name": "Updated Manufacturing",
            "description": "Updated description",
            "is_active": False
        }
        
        response = test_client.put(f"/api/v1/domains/{domain_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Updated Manufacturing"
        assert data["description"] == "Updated description"
        assert data["is_active"] == False
        assert data["code"] == sample_domain_data["code"]  # Code unchanged
    
    def test_delete_domain_success(self, test_client: TestClient, sample_domain_data):
        """Test successful domain deletion."""
        # Create domain
        create_response = test_client.post("/api/v1/domains", json=sample_domain_data)
        domain_id = create_response.json()["id"]
        
        # Delete domain
        response = test_client.delete(f"/api/v1/domains/{domain_id}")
        assert response.status_code == 204
        
        # Verify deletion
        get_response = test_client.get(f"/api/v1/domains/{domain_id}")
        assert get_response.status_code == 404


class TestVLANAPI:
    """Test suite for VLAN API endpoints."""
    
    def test_create_vlan_success(self, test_client: TestClient, sample_domain_data, sample_value_stream_data, sample_zone_data):
        """Test successful VLAN creation via API."""
        # Create prerequisite data
        domain_response = test_client.post("/api/v1/domains", json=sample_domain_data)
        domain_id = domain_response.json()["id"]
        
        vs_data = {**sample_value_stream_data, "domain_id": domain_id}
        vs_response = test_client.post("/api/v1/value-streams", json=vs_data)
        vs_id = vs_response.json()["id"]
        
        zone_data = {**sample_zone_data, "value_stream_id": vs_id}
        zone_response = test_client.post("/api/v1/zones", json=zone_data)
        zone_id = zone_response.json()["id"]
        
        # Create VLAN
        vlan_data = {
            "zone_id": zone_id,
            "vlan_id": 100,
            "subnet": "192.168.100.0",
            "netmask": "/24",
            "description": "Test VLAN",
            "is_active": True
        }
        
        response = test_client.post("/api/v1/vlans", json=vlan_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["vlan_id"] == 100
        assert data["subnet"] == "192.168.100.0"
        assert data["netmask"] == "/24"
        assert data["default_gateway"] == "192.168.100.1"
        assert data["net_start"] == "192.168.100.7"
        assert data["net_end"] == "192.168.100.253"
    
    def test_create_vlan_invalid_subnet(self, test_client: TestClient, sample_domain_data, sample_value_stream_data, sample_zone_data):
        """Test VLAN creation with invalid subnet."""
        # Create prerequisite data (simplified for test)
        domain_response = test_client.post("/api/v1/domains", json=sample_domain_data)
        domain_id = domain_response.json()["id"]
        
        vs_data = {**sample_value_stream_data, "domain_id": domain_id}
        vs_response = test_client.post("/api/v1/value-streams", json=vs_data)
        vs_id = vs_response.json()["id"]
        
        zone_data = {**sample_zone_data, "value_stream_id": vs_id}
        zone_response = test_client.post("/api/v1/zones", json=zone_data)
        zone_id = zone_response.json()["id"]
        
        # Attempt VLAN with invalid subnet
        vlan_data = {
            "zone_id": zone_id,
            "vlan_id": 100,
            "subnet": "invalid.subnet",
            "netmask": "/24",
            "description": "Invalid VLAN",
            "is_active": True
        }
        
        response = test_client.post("/api/v1/vlans", json=vlan_data)
        assert response.status_code == 400
        assert "Invalid subnet" in response.json()["detail"]
    
    def test_assign_ip_success(self, test_client: TestClient):
        """Test successful IP assignment via API."""
        # This test would require full setup chain
        # Simplified for demonstration
        pass
    
    def test_get_vlan_utilization(self, test_client: TestClient):
        """Test VLAN utilization endpoint."""
        # This test would require VLAN with IP assignments
        # Simplified for demonstration
        pass


class TestHealthAPI:
    """Test suite for Health and monitoring endpoints."""
    
    def test_health_check(self, test_client: TestClient):
        """Test health check endpoint."""
        response = test_client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data
    
    def test_api_info(self, test_client: TestClient):
        """Test API information endpoint."""
        response = test_client.get("/api/v1/info")
        assert response.status_code == 200
        
        data = response.json()
        assert "version" in data
        assert "environment" in data


class TestSecurityAPI:
    """Test suite for API security features."""
    
    def test_cors_headers(self, test_client: TestClient):
        """Test CORS headers are properly set."""
        response = test_client.options("/api/v1/domains")
        assert response.status_code == 200
        # CORS headers would be checked here
    
    def test_input_validation_sql_injection(self, test_client: TestClient):
        """Test protection against SQL injection attempts."""
        malicious_data = {
            "code": "'; DROP TABLE domains; --",
            "name": "Malicious Domain",
            "description": "SQL injection test",
            "is_active": True
        }
        
        response = test_client.post("/api/v1/domains", json=malicious_data)
        # Should be rejected due to validation
        assert response.status_code in [400, 422]
    
    def test_input_validation_xss(self, test_client: TestClient):
        """Test protection against XSS attempts."""
        xss_data = {
            "code": "XSS",
            "name": "<script>alert('xss')</script>",
            "description": "XSS test",
            "is_active": True
        }
        
        response = test_client.post("/api/v1/domains", json=xss_data)
        if response.status_code == 201:
            # If created, ensure script tags are escaped/sanitized
            data = response.json()
            assert "<script>" not in data["name"]
    
    def test_rate_limiting(self, test_client: TestClient):
        """Test API rate limiting (if implemented)."""
        # Make multiple rapid requests
        responses = []
        for i in range(100):
            response = test_client.get("/api/v1/domains")
            responses.append(response.status_code)
        
        # Check if rate limiting kicks in
        # This would depend on rate limiting implementation
        pass


class TestErrorHandling:
    """Test suite for API error handling."""
    
    def test_404_not_found(self, test_client: TestClient):
        """Test 404 error handling."""
        response = test_client.get("/api/v1/nonexistent")
        assert response.status_code == 404
    
    def test_405_method_not_allowed(self, test_client: TestClient):
        """Test 405 error handling."""
        response = test_client.patch("/api/v1/domains")  # PATCH not supported
        assert response.status_code == 405
    
    def test_422_validation_error(self, test_client: TestClient):
        """Test validation error handling."""
        invalid_data = {"invalid": "data"}
        response = test_client.post("/api/v1/domains", json=invalid_data)
        assert response.status_code == 422
        
        error_data = response.json()
        assert "detail" in error_data
        assert isinstance(error_data["detail"], list)
    
    def test_500_internal_server_error_handling(self, test_client: TestClient):
        """Test internal server error handling."""
        # This would require triggering an actual server error
        # Could be done by mocking database failures
        pass


class TestPerformanceAPI:
    """Test suite for API performance requirements."""
    
    def test_response_time_domains(self, test_client: TestClient):
        """Test domain API response times."""
        import time
        
        # Create test data
        for i in range(10):
            domain_data = {
                "code": f"TST{i:02d}",
                "name": f"Test Domain {i}",
                "description": f"Test domain {i}",
                "is_active": True
            }
            test_client.post("/api/v1/domains", json=domain_data)
        
        # Test list performance
        start_time = time.time()
        response = test_client.get("/api/v1/domains")
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 0.5, f"Domain list took {response_time:.3f}s, should be <0.5s"
    
    def test_concurrent_requests(self, test_client: TestClient):
        """Test handling of concurrent API requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = test_client.get("/health")
            results.append(response.status_code)
        
        # Create multiple concurrent threads
        threads = []
        for i in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        # Start all threads
        start_time = time.time()
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        end_time = time.time()
        
        # All requests should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 10
        
        # Total time should be reasonable
        total_time = end_time - start_time
        assert total_time < 2.0, f"Concurrent requests took {total_time:.3f}s"