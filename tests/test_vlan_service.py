"""
Comprehensive tests for VLAN Service functionality.

Tests VLAN creation, IP allocation, network validation according to 
Bosch Rexroth IT/OT network segmentation requirements.
"""

import pytest
import asyncio
from uuid import uuid4
from ipaddress import IPv4Network, IPv4Address

from src.ip_management.services.ip_service import IPManagementService
from src.ip_management.models.schemas import VLANCreate, VLANUpdate, IPAssignmentCreate
from src.ip_management.models.exceptions import VLANConfigurationError, InvalidSubnetError


class TestVLANService:
    """Test suite for VLAN Service operations."""
    
    @pytest.mark.asyncio
    async def test_create_vlan_success(self, ip_service: IPManagementService, populated_database):
        """Test successful VLAN creation with automatic IP calculation."""
        zone = populated_database["zone"]
        
        vlan_data = {
            "zone_id": zone.id,
            "vlan_id": 200,
            "subnet": "10.1.1.0",
            "netmask": "/24",
            "description": "Test VLAN for manufacturing",
            "is_active": True
        }
        
        vlan_create = VLANCreate(**vlan_data)
        vlan = await ip_service.create_vlan(vlan_create)
        
        assert vlan.vlan_id == 200
        assert vlan.subnet == "10.1.1.0"
        assert vlan.netmask == "/24"
        assert vlan.default_gateway == "10.1.1.1"
        assert vlan.net_start == "10.1.1.7"  # After 6 reserved IPs
        assert vlan.net_end == "10.1.1.253"  # Before last reserved IP
        assert vlan.total_ips == 254
        assert vlan.assignable_ips == 247  # 254 - 6 - 1 = 247
        assert vlan.zone_id == zone.id
    
    @pytest.mark.asyncio
    async def test_create_vlan_duplicate_id_same_zone(self, ip_service: IPManagementService, populated_database):
        """Test VLAN creation with duplicate VLAN ID in same zone fails."""
        zone = populated_database["zone"]
        
        vlan_data = {
            "zone_id": zone.id,
            "vlan_id": 100,
            "subnet": "10.1.1.0",
            "netmask": "/24",
            "description": "First VLAN",
            "is_active": True
        }
        
        # Create first VLAN
        vlan_create = VLANCreate(**vlan_data)
        await ip_service.create_vlan(vlan_create)
        
        # Attempt to create duplicate VLAN ID in same zone
        duplicate_data = {**vlan_data, "subnet": "10.1.2.0", "description": "Duplicate VLAN"}
        duplicate_create = VLANCreate(**duplicate_data)
        
        with pytest.raises(VLANConfigurationError, match="VLAN ID 100 already exists"):
            await ip_service.create_vlan(duplicate_create)
    
    @pytest.mark.asyncio
    async def test_create_vlan_invalid_vlan_id(self, ip_service: IPManagementService, populated_database):
        """Test VLAN creation with invalid VLAN ID."""
        zone = populated_database["zone"]
        
        invalid_vlan_ids = [0, -1, 4095, 5000]
        
        for invalid_id in invalid_vlan_ids:
            vlan_data = {
                "zone_id": zone.id,
                "vlan_id": invalid_id,
                "subnet": "10.1.1.0",
                "netmask": "/24",
                "description": f"Invalid VLAN {invalid_id}",
                "is_active": True
            }
            
            with pytest.raises((VLANConfigurationError, ValueError)):
                vlan_create = VLANCreate(**vlan_data)
                await ip_service.create_vlan(vlan_create)
    
    @pytest.mark.asyncio
    async def test_create_vlan_invalid_subnet(self, ip_service: IPManagementService, populated_database):
        """Test VLAN creation with invalid subnet configurations."""
        zone = populated_database["zone"]
        
        invalid_subnets = [
            ("invalid.subnet", "/24"),
            ("192.168.1.0", "/33"),  # Invalid CIDR
            ("192.168.1.0", "/30"),  # Too small (insufficient IP space)
            ("192.168.1.1", "/24"),  # Not network address
        ]
        
        for subnet, netmask in invalid_subnets:
            vlan_data = {
                "zone_id": zone.id,
                "vlan_id": 100,
                "subnet": subnet,
                "netmask": netmask,
                "description": "Invalid subnet test",
                "is_active": True
            }
            
            with pytest.raises((InvalidSubnetError, VLANConfigurationError)):
                vlan_create = VLANCreate(**vlan_data)
                await ip_service.create_vlan(vlan_create)
    
    @pytest.mark.asyncio
    async def test_create_vlan_performance_requirement(self, ip_service: IPManagementService, populated_database):
        """Test VLAN creation meets <1 second performance requirement."""
        import time
        
        zone = populated_database["zone"]
        
        vlan_data = {
            "zone_id": zone.id,
            "vlan_id": 300,
            "subnet": "10.3.0.0",
            "netmask": "/16",  # Large subnet for performance test
            "description": "Performance test VLAN",
            "is_active": True
        }
        
        start_time = time.time()
        vlan_create = VLANCreate(**vlan_data)
        vlan = await ip_service.create_vlan(vlan_create)
        end_time = time.time()
        
        creation_time = end_time - start_time
        assert creation_time < 1.0, f"VLAN creation took {creation_time:.3f}s, exceeds 1s requirement"
        assert vlan.assignable_ips == 65527  # /16 network minus reserved IPs
    
    @pytest.mark.asyncio
    async def test_assign_ip_success(self, ip_service: IPManagementService, populated_database):
        """Test successful IP assignment within VLAN range."""
        vlan = populated_database["vlan"]
        
        ip_data = {
            "vlan_id": vlan.id,
            "ip_address": "192.168.100.10",
            "mac_address": "00:11:22:33:44:55",
            "ci_name": "TEST-DEVICE-001",
            "description": "Test device for IP assignment",
            "is_active": True
        }
        
        ip_create = IPAssignmentCreate(**ip_data)
        assignment = await ip_service.assign_ip(ip_create)
        
        assert assignment.ip_address == "192.168.100.10"
        assert assignment.mac_address == "00:11:22:33:44:55"
        assert assignment.ci_name == "TEST-DEVICE-001"
        assert assignment.vlan_id == vlan.id
        assert assignment.is_active == True
    
    @pytest.mark.asyncio
    async def test_assign_ip_reserved_range(self, ip_service: IPManagementService, populated_database):
        """Test IP assignment in reserved range fails."""
        vlan = populated_database["vlan"]
        
        # Try to assign IP in reserved start range (first 6 IPs)
        reserved_ips = ["192.168.100.1", "192.168.100.2", "192.168.100.6"]
        
        for reserved_ip in reserved_ips:
            ip_data = {
                "vlan_id": vlan.id,
                "ip_address": reserved_ip,
                "mac_address": "00:11:22:33:44:55",
                "ci_name": "TEST-DEVICE-RESERVED",
                "description": "Test reserved IP assignment",
                "is_active": True
            }
            
            with pytest.raises(VLANConfigurationError, match="IP address .* is in reserved range"):
                ip_create = IPAssignmentCreate(**ip_data)
                await ip_service.assign_ip(ip_create)
        
        # Try to assign last IP (reserved end range)
        ip_data = {
            "vlan_id": vlan.id,
            "ip_address": "192.168.100.254",
            "mac_address": "00:11:22:33:44:55",
            "ci_name": "TEST-DEVICE-LAST",
            "description": "Test last IP assignment",
            "is_active": True
        }
        
        with pytest.raises(VLANConfigurationError, match="IP address .* is in reserved range"):
            ip_create = IPAssignmentCreate(**ip_data)
            await ip_service.assign_ip(ip_create)
    
    @pytest.mark.asyncio
    async def test_assign_ip_duplicate(self, ip_service: IPManagementService, populated_database):
        """Test duplicate IP assignment fails."""
        vlan = populated_database["vlan"]
        
        ip_data = {
            "vlan_id": vlan.id,
            "ip_address": "192.168.100.10",
            "mac_address": "00:11:22:33:44:55",
            "ci_name": "FIRST-DEVICE",
            "description": "First device",
            "is_active": True
        }
        
        # Create first assignment
        ip_create = IPAssignmentCreate(**ip_data)
        await ip_service.assign_ip(ip_create)
        
        # Attempt duplicate assignment
        duplicate_data = {**ip_data, "mac_address": "00:11:22:33:44:66", "ci_name": "SECOND-DEVICE"}
        duplicate_create = IPAssignmentCreate(**duplicate_data)
        
        with pytest.raises(VLANConfigurationError, match="IP address .* is already assigned"):
            await ip_service.assign_ip(duplicate_create)
    
    @pytest.mark.asyncio
    async def test_assign_ip_invalid_mac_address(self, ip_service: IPManagementService, populated_database):
        """Test IP assignment with invalid MAC address formats."""
        vlan = populated_database["vlan"]
        
        invalid_macs = [
            "invalid-mac",
            "00:11:22:33:44",  # Too short
            "00:11:22:33:44:55:66",  # Too long
            "GG:11:22:33:44:55",  # Invalid hex
            "00-11-22-33-44-55",  # Wrong separator
        ]
        
        for invalid_mac in invalid_macs:
            ip_data = {
                "vlan_id": vlan.id,
                "ip_address": "192.168.100.10",
                "mac_address": invalid_mac,
                "ci_name": "TEST-DEVICE",
                "description": "Invalid MAC test",
                "is_active": True
            }
            
            with pytest.raises((ValueError, VLANConfigurationError)):
                ip_create = IPAssignmentCreate(**ip_data)
                await ip_service.assign_ip(ip_create)
    
    @pytest.mark.asyncio
    async def test_get_vlan_utilization(self, ip_service: IPManagementService, populated_database):
        """Test VLAN utilization calculation."""
        vlan = populated_database["vlan"]
        
        # Assign multiple IPs
        for i in range(10, 15):
            ip_data = {
                "vlan_id": vlan.id,
                "ip_address": f"192.168.100.{i}",
                "mac_address": f"00:11:22:33:44:{i:02x}",
                "ci_name": f"DEVICE-{i:03d}",
                "description": f"Test device {i}",
                "is_active": True
            }
            ip_create = IPAssignmentCreate(**ip_data)
            await ip_service.assign_ip(ip_create)
        
        # Get utilization
        utilization = await ip_service.get_vlan_utilization(vlan.id)
        
        assert utilization["total_ips"] == vlan.total_ips
        assert utilization["assignable_ips"] == vlan.assignable_ips
        assert utilization["assigned_ips"] == 5
        assert utilization["available_ips"] == vlan.assignable_ips - 5
        assert utilization["utilization_percentage"] == (5 / vlan.assignable_ips) * 100
    
    @pytest.mark.asyncio
    async def test_vlan_security_type_validation(self, ip_service: IPManagementService, populated_database):
        """Test VLAN creation respects zone security types."""
        zone = populated_database["zone"]
        
        # Test that VLAN inherits security constraints from zone
        vlan_data = {
            "zone_id": zone.id,
            "vlan_id": 400,
            "subnet": "10.4.0.0",
            "netmask": "/24",
            "description": "Security test VLAN",
            "is_active": True
        }
        
        vlan_create = VLANCreate(**vlan_data)
        vlan = await ip_service.create_vlan(vlan_create)
        
        # Verify VLAN has reference to zone security type
        assert vlan.zone.security_type == zone.security_type
    
    @pytest.mark.asyncio
    async def test_concurrent_ip_assignment(self, ip_service: IPManagementService, populated_database):
        """Test concurrent IP assignments to same address."""
        vlan = populated_database["vlan"]
        
        # Create multiple concurrent tasks trying to assign same IP
        tasks = []
        for i in range(5):
            ip_data = {
                "vlan_id": vlan.id,
                "ip_address": "192.168.100.50",
                "mac_address": f"00:11:22:33:44:{i:02x}",
                "ci_name": f"DEVICE-{i}",
                "description": f"Concurrent test device {i}",
                "is_active": True
            }
            ip_create = IPAssignmentCreate(**ip_data)
            task = asyncio.create_task(ip_service.assign_ip(ip_create))
            tasks.append(task)
        
        # Only one should succeed, others should fail
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for r in results if not isinstance(r, Exception))
        error_count = sum(1 for r in results if isinstance(r, Exception))
        
        assert success_count == 1
        assert error_count == 4
    
    @pytest.mark.asyncio
    async def test_vlan_network_overlap_detection(self, ip_service: IPManagementService, populated_database):
        """Test detection of overlapping VLAN networks."""
        zone = populated_database["zone"]
        
        # Create first VLAN
        vlan1_data = {
            "zone_id": zone.id,
            "vlan_id": 500,
            "subnet": "10.5.0.0",
            "netmask": "/24",
            "description": "First VLAN",
            "is_active": True
        }
        vlan1_create = VLANCreate(**vlan1_data)
        await ip_service.create_vlan(vlan1_create)
        
        # Attempt to create overlapping VLAN
        overlapping_data = {
            "zone_id": zone.id,
            "vlan_id": 501,
            "subnet": "10.5.0.0",  # Same subnet
            "netmask": "/25",      # Different mask but overlapping
            "description": "Overlapping VLAN",
            "is_active": True
        }
        
        with pytest.raises(VLANConfigurationError, match="Network overlap detected"):
            overlapping_create = VLANCreate(**overlapping_data)
            await ip_service.create_vlan(overlapping_create)