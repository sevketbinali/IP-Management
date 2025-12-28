"""
IP address calculation and subnet management utilities.

Handles automatic IP generation, subnet validation, and reserved IP management
according to Bosch Rexroth IT/OT network standards.
"""

import ipaddress
from typing import List, Tuple, Set
from dataclasses import dataclass

from ..models.exceptions import InvalidSubnetError, InsufficientIPSpaceError


@dataclass
class IPRange:
    """Represents an IP address range with metadata."""
    start_ip: ipaddress.IPv4Address
    end_ip: ipaddress.IPv4Address
    is_reserved: bool = False
    description: str = ""


class IPCalculator:
    """
    Core IP calculation engine for VLAN subnet management.
    
    Implements Bosch Rexroth standards:
    - First 6 IPs reserved as management IPs
    - Last IP reserved as broadcast/management
    - Automatic subnet validation and IP generation
    """
    
    RESERVED_START_COUNT = 6
    RESERVED_END_COUNT = 1
    
    def __init__(self) -> None:
        self._reserved_ips: Set[ipaddress.IPv4Address] = set()
    
    def calculate_subnet_info(
        self, 
        subnet: str, 
        netmask: str
    ) -> Tuple[ipaddress.IPv4Network, List[IPRange]]:
        """
        Calculate subnet information and generate IP ranges.
        
        Args:
            subnet: Network address (e.g., "192.168.1.0")
            netmask: Subnet mask (e.g., "255.255.255.0" or "/24")
            
        Returns:
            Tuple of (network object, list of IP ranges)
            
        Raises:
            InvalidSubnetError: If subnet/netmask combination is invalid
            InsufficientIPSpaceError: If subnet too small for reserved IPs
        """
        try:
            # Handle both CIDR and dotted decimal netmask formats
            if netmask.startswith('/'):
                network = ipaddress.IPv4Network(f"{subnet}{netmask}", strict=False)
            else:
                # Convert dotted decimal to CIDR
                netmask_obj = ipaddress.IPv4Address(netmask)
                prefix_len = sum(bin(int(octet)).count('1') for octet in str(netmask_obj).split('.'))
                network = ipaddress.IPv4Network(f"{subnet}/{prefix_len}", strict=False)
                
        except (ipaddress.AddressValueError, ValueError) as e:
            raise InvalidSubnetError(f"Invalid subnet configuration: {e}") from e
        
        # Validate minimum subnet size
        total_hosts = network.num_addresses - 2  # Exclude network and broadcast
        required_reserved = self.RESERVED_START_COUNT + self.RESERVED_END_COUNT
        
        if total_hosts < required_reserved + 1:  # +1 for at least one assignable IP
            raise InsufficientIPSpaceError(
                f"Subnet too small. Need at least {required_reserved + 1} host addresses, "
                f"but subnet only provides {total_hosts}"
            )
        
        return network, self._generate_ip_ranges(network)
    
    def _generate_ip_ranges(self, network: ipaddress.IPv4Network) -> List[IPRange]:
        """Generate IP ranges with reserved and assignable sections."""
        hosts = list(network.hosts())
        ranges = []
        
        # Reserved management IPs (first 6)
        if len(hosts) >= self.RESERVED_START_COUNT:
            ranges.append(IPRange(
                start_ip=hosts[0],
                end_ip=hosts[self.RESERVED_START_COUNT - 1],
                is_reserved=True,
                description="Management IPs (Reserved)"
            ))
        
        # Assignable IP range
        assignable_start = self.RESERVED_START_COUNT
        assignable_end = len(hosts) - self.RESERVED_END_COUNT - 1
        
        if assignable_start <= assignable_end:
            ranges.append(IPRange(
                start_ip=hosts[assignable_start],
                end_ip=hosts[assignable_end],
                is_reserved=False,
                description="Assignable IPs"
            ))
        
        # Reserved last IP
        if len(hosts) >= self.RESERVED_END_COUNT:
            ranges.append(IPRange(
                start_ip=hosts[-1],
                end_ip=hosts[-1],
                is_reserved=True,
                description="Management IP (Reserved)"
            ))
        
        return ranges
    
    def get_default_gateway(self, network: ipaddress.IPv4Network) -> ipaddress.IPv4Address:
        """Get the default gateway IP (typically first host address)."""
        hosts = list(network.hosts())
        return hosts[0] if hosts else network.network_address
    
    def get_net_start_end(self, network: ipaddress.IPv4Network) -> Tuple[ipaddress.IPv4Address, ipaddress.IPv4Address]:
        """Get the assignable IP range start and end addresses."""
        hosts = list(network.hosts())
        if len(hosts) < self.RESERVED_START_COUNT + self.RESERVED_END_COUNT:
            raise InsufficientIPSpaceError("Insufficient IP space for assignable range")
        
        start_ip = hosts[self.RESERVED_START_COUNT]
        end_ip = hosts[-(self.RESERVED_END_COUNT + 1)]
        
        return start_ip, end_ip
    
    def is_ip_assignable(self, ip: ipaddress.IPv4Address, network: ipaddress.IPv4Network) -> bool:
        """Check if an IP address is assignable (not reserved)."""
        if ip not in network:
            return False
        
        hosts = list(network.hosts())
        ip_index = hosts.index(ip)
        
        # Check if IP is in reserved ranges
        is_start_reserved = ip_index < self.RESERVED_START_COUNT
        is_end_reserved = ip_index >= len(hosts) - self.RESERVED_END_COUNT
        
        return not (is_start_reserved or is_end_reserved)
    
    def validate_vlan_configuration(
        self, 
        vlan_id: int, 
        subnet: str, 
        netmask: str
    ) -> dict:
        """
        Validate complete VLAN configuration and return calculated values.
        
        Returns:
            Dictionary with calculated network parameters
        """
        if not (1 <= vlan_id <= 4094):
            raise InvalidSubnetError("VLAN ID must be between 1 and 4094")
        
        network, ip_ranges = self.calculate_subnet_info(subnet, netmask)
        gateway = self.get_default_gateway(network)
        net_start, net_end = self.get_net_start_end(network)
        
        return {
            "vlan_id": vlan_id,
            "network": str(network),
            "subnet": str(network.network_address),
            "netmask": str(network.netmask),
            "default_gateway": str(gateway),
            "net_start": str(net_start),
            "net_end": str(net_end),
            "total_ips": network.num_addresses - 2,
            "assignable_ips": len([r for r in ip_ranges if not r.is_reserved]),
            "reserved_ranges": [
                {
                    "start": str(r.start_ip),
                    "end": str(r.end_ip),
                    "description": r.description
                }
                for r in ip_ranges if r.is_reserved
            ]
        }