"""
Tests for IP Calculator core functionality.

Validates subnet calculations, IP range generation, and reserved IP management
according to Bosch Rexroth IT/OT network standards.
"""

import pytest
import ipaddress
from src.ip_management.core.ip_calculator import IPCalculator
from src.ip_management.models.exceptions import InvalidSubnetError, InsufficientIPSpaceError


class TestIPCalculator:
    """Test suite for IP Calculator functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.calculator = IPCalculator()
    
    def test_calculate_subnet_info_valid_cidr(self):
        """Test subnet calculation with CIDR notation."""
        network, ranges = self.calculator.calculate_subnet_info("192.168.1.0", "/24")
        
        assert str(network) == "192.168.1.0/24"
        assert len(ranges) == 3  # Reserved start, assignable, reserved end
        
        # Check reserved start range (first 6 IPs)
        reserved_start = ranges[0]
        assert reserved_start.is_reserved
        assert str(reserved_start.start_ip) == "192.168.1.1"
        assert str(reserved_start.end_ip) == "192.168.1.6"
        
        # Check assignable range
        assignable = ranges[1]
        assert not assignable.is_reserved
        assert str(assignable.start_ip) == "192.168.1.7"
        assert str(assignable.end_ip) == "192.168.1.253"
        
        # Check reserved end range (last IP)
        reserved_end = ranges[2]
        assert reserved_end.is_reserved
        assert str(reserved_end.start_ip) == "192.168.1.254"
        assert str(reserved_end.end_ip) == "192.168.1.254"
    
    def test_calculate_subnet_info_dotted_decimal(self):
        """Test subnet calculation with dotted decimal netmask."""
        network, ranges = self.calculator.calculate_subnet_info("10.0.0.0", "255.255.255.0")
        
        assert str(network) == "10.0.0.0/24"
        assert len(ranges) == 3
    
    def test_calculate_subnet_info_small_subnet(self):
        """Test subnet calculation with /30 subnet (insufficient space)."""
        with pytest.raises(InsufficientIPSpaceError):
            self.calculator.calculate_subnet_info("192.168.1.0", "/30")
    
    def test_calculate_subnet_info_invalid_subnet(self):
        """Test subnet calculation with invalid subnet address."""
        with pytest.raises(InvalidSubnetError):
            self.calculator.calculate_subnet_info("invalid.subnet", "/24")
    
    def test_calculate_subnet_info_invalid_netmask(self):
        """Test subnet calculation with invalid netmask."""
        with pytest.raises(InvalidSubnetError):
            self.calculator.calculate_subnet_info("192.168.1.0", "invalid.mask")
    
    def test_get_default_gateway(self):
        """Test default gateway calculation (first host IP)."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        gateway = self.calculator.get_default_gateway(network)
        
        assert str(gateway) == "192.168.1.1"
    
    def test_get_net_start_end(self):
        """Test assignable IP range calculation."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        start_ip, end_ip = self.calculator.get_net_start_end(network)
        
        assert str(start_ip) == "192.168.1.7"  # After 6 reserved IPs
        assert str(end_ip) == "192.168.1.253"  # Before last reserved IP
    
    def test_is_ip_assignable_valid(self):
        """Test IP assignability check for valid assignable IP."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        ip = ipaddress.IPv4Address("192.168.1.10")
        
        assert self.calculator.is_ip_assignable(ip, network)
    
    def test_is_ip_assignable_reserved_start(self):
        """Test IP assignability check for reserved start IP."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        ip = ipaddress.IPv4Address("192.168.1.3")  # Within first 6
        
        assert not self.calculator.is_ip_assignable(ip, network)
    
    def test_is_ip_assignable_reserved_end(self):
        """Test IP assignability check for reserved end IP."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        ip = ipaddress.IPv4Address("192.168.1.254")  # Last IP
        
        assert not self.calculator.is_ip_assignable(ip, network)
    
    def test_is_ip_assignable_outside_network(self):
        """Test IP assignability check for IP outside network."""
        network = ipaddress.IPv4Network("192.168.1.0/24")
        ip = ipaddress.IPv4Address("192.168.2.10")
        
        assert not self.calculator.is_ip_assignable(ip, network)
    
    def test_validate_vlan_configuration_valid(self):
        """Test complete VLAN configuration validation."""
        result = self.calculator.validate_vlan_configuration(100, "192.168.1.0", "/24")
        
        assert result["vlan_id"] == 100
        assert result["network"] == "192.168.1.0/24"
        assert result["subnet"] == "192.168.1.0"
        assert result["netmask"] == "255.255.255.0"
        assert result["default_gateway"] == "192.168.1.1"
        assert result["net_start"] == "192.168.1.7"
        assert result["net_end"] == "192.168.1.253"
        assert result["total_ips"] == 254  # Excluding network and broadcast
        assert len(result["reserved_ranges"]) == 2  # Start and end ranges
    
    def test_validate_vlan_configuration_invalid_vlan_id(self):
        """Test VLAN configuration validation with invalid VLAN ID."""
        with pytest.raises(InvalidSubnetError):
            self.calculator.validate_vlan_configuration(0, "192.168.1.0", "/24")
        
        with pytest.raises(InvalidSubnetError):
            self.calculator.validate_vlan_configuration(4095, "192.168.1.0", "/24")
    
    def test_large_subnet_calculation(self):
        """Test calculation with large subnet (/16)."""
        network, ranges = self.calculator.calculate_subnet_info("10.0.0.0", "/16")
        
        assert str(network) == "10.0.0.0/16"
        assert len(ranges) == 3
        
        # Verify assignable range is correct
        assignable = ranges[1]
        assert str(assignable.start_ip) == "10.0.0.7"
        assert str(assignable.end_ip) == "10.0.255.253"
    
    def test_minimum_viable_subnet(self):
        """Test calculation with minimum viable subnet (/29)."""
        network, ranges = self.calculator.calculate_subnet_info("192.168.1.0", "/29")
        
        assert str(network) == "192.168.1.0/29"
        assert len(ranges) == 3
        
        # Should have exactly 1 assignable IP (6 reserved + 1 assignable + 1 reserved = 8 total)
        assignable = ranges[1]
        assert str(assignable.start_ip) == "192.168.1.7"
        assert str(assignable.end_ip) == "192.168.1.7"