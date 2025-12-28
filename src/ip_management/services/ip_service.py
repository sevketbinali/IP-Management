"""
IP Management Service Layer

Orchestrates IP allocation, VLAN management, and network operations
with comprehensive validation and audit logging.
"""

import ipaddress
from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
import logging

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, or_

from ..models.database import Domain, ValueStream, Zone, VLAN, IPAssignment, SecurityType
from ..models.exceptions import (
    IPAllocationError, ReservedIPError, VLANConfigurationError,
    DomainNotFoundError, ZoneNotFoundError, ValueStreamNotFoundError
)
from ..core.ip_calculator import IPCalculator
from ..models.schemas import (
    DomainCreate, ValueStreamCreate, ZoneCreate, VLANCreate, IPAssignmentCreate,
    VLANCalculationResult, IPAvailabilityResponse
)

logger = logging.getLogger(__name__)


class IPManagementService:
    """
    Core service for IP and VLAN management operations.
    
    Implements business rules for Bosch Rexroth IT/OT network management
    with comprehensive validation and audit logging.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.ip_calculator = IPCalculator()
    
    # Domain Management
    async def create_domain(self, domain_data: DomainCreate) -> Domain:
        """Create a new domain with validation."""
        try:
            domain = Domain(**domain_data.model_dump())
            self.db.add(domain)
            self.db.commit()
            self.db.refresh(domain)
            
            logger.info(f"Created domain: {domain.code}")
            return domain
            
        except IntegrityError as e:
            self.db.rollback()
            raise VLANConfigurationError(f"Domain code '{domain_data.code}' already exists") from e
    
    async def get_domain(self, domain_id: UUID) -> Domain:
        """Get domain by ID."""
        domain = self.db.query(Domain).filter(Domain.id == domain_id).first()
        if not domain:
            raise DomainNotFoundError(f"Domain {domain_id} not found")
        return domain
    
    async def list_domains(self, active_only: bool = True) -> List[Domain]:
        """List all domains."""
        query = self.db.query(Domain)
        if active_only:
            query = query.filter(Domain.is_active == True)
        return query.all()
    
    # Value Stream Management
    async def create_value_stream(self, vs_data: ValueStreamCreate) -> ValueStream:
        """Create a new value stream."""
        # Validate parent domain exists
        domain = await self.get_domain(vs_data.domain_id)
        
        try:
            value_stream = ValueStream(**vs_data.model_dump())
            self.db.add(value_stream)
            self.db.commit()
            self.db.refresh(value_stream)
            
            logger.info(f"Created value stream: {value_stream.code} in domain {domain.code}")
            return value_stream
            
        except IntegrityError as e:
            self.db.rollback()
            raise VLANConfigurationError(
                f"Value stream code '{vs_data.code}' already exists in domain"
            ) from e
    
    async def get_value_stream(self, vs_id: UUID) -> ValueStream:
        """Get value stream by ID."""
        vs = self.db.query(ValueStream).filter(ValueStream.id == vs_id).first()
        if not vs:
            raise ValueStreamNotFoundError(f"Value stream {vs_id} not found")
        return vs
    
    # Zone Management
    async def create_zone(self, zone_data: ZoneCreate) -> Zone:
        """Create a new zone with security validation."""
        # Validate parent value stream exists
        vs = await self.get_value_stream(zone_data.value_stream_id)
        
        # Validate security type
        if zone_data.security_type not in SecurityType:
            raise VLANConfigurationError(f"Invalid security type: {zone_data.security_type}")
        
        zone = Zone(**zone_data.model_dump())
        self.db.add(zone)
        self.db.commit()
        self.db.refresh(zone)
        
        logger.info(f"Created zone: {zone.name} with security type {zone.security_type}")
        return zone
    
    async def get_zone(self, zone_id: UUID) -> Zone:
        """Get zone by ID."""
        zone = self.db.query(Zone).filter(Zone.id == zone_id).first()
        if not zone:
            raise ZoneNotFoundError(f"Zone {zone_id} not found")
        return zone
    
    async def update_firewall_check(self, zone_id: UUID) -> Zone:
        """Update last firewall rule check timestamp."""
        zone = await self.get_zone(zone_id)
        zone.last_firewall_check = datetime.utcnow()
        self.db.commit()
        self.db.refresh(zone)
        
        logger.info(f"Updated firewall check for zone: {zone.name}")
        return zone
    
    # VLAN Management
    async def create_vlan(self, vlan_data: VLANCreate) -> VLAN:
        """
        Create a new VLAN with automatic IP calculation.
        
        Implements Bosch Rexroth requirements:
        - Automatic IP generation based on subnet size
        - Reserved IP management (first 6 + last IP)
        - VLAN ID uniqueness validation
        """
        # Validate parent zone exists
        zone = await self.get_zone(vlan_data.zone_id)
        
        # Check VLAN ID uniqueness
        existing_vlan = self.db.query(VLAN).filter(VLAN.vlan_id == vlan_data.vlan_id).first()
        if existing_vlan:
            raise VLANConfigurationError(f"VLAN ID {vlan_data.vlan_id} already exists")
        
        # Calculate network parameters
        try:
            calc_result = self.ip_calculator.validate_vlan_configuration(
                vlan_data.vlan_id,
                vlan_data.subnet,
                vlan_data.netmask
            )
        except Exception as e:
            raise VLANConfigurationError(f"VLAN calculation failed: {e}") from e
        
        # Create VLAN with calculated values
        vlan = VLAN(
            zone_id=vlan_data.zone_id,
            vlan_id=vlan_data.vlan_id,
            subnet=vlan_data.subnet,
            netmask=vlan_data.netmask,
            default_gateway=calc_result["default_gateway"],
            net_start=calc_result["net_start"],
            net_end=calc_result["net_end"],
            description=vlan_data.description,
            is_active=vlan_data.is_active
        )
        
        self.db.add(vlan)
        self.db.commit()
        self.db.refresh(vlan)
        
        logger.info(f"Created VLAN {vlan.vlan_id} in zone {zone.name}")
        return vlan
    
    async def get_vlan(self, vlan_id: UUID) -> VLAN:
        """Get VLAN by ID."""
        vlan = self.db.query(VLAN).filter(VLAN.id == vlan_id).first()
        if not vlan:
            raise VLANConfigurationError(f"VLAN {vlan_id} not found")
        return vlan
    
    async def calculate_vlan_parameters(
        self, 
        vlan_id: int, 
        subnet: str, 
        netmask: str
    ) -> VLANCalculationResult:
        """Calculate VLAN parameters without creating the VLAN."""
        calc_result = self.ip_calculator.validate_vlan_configuration(vlan_id, subnet, netmask)
        return VLANCalculationResult(**calc_result)
    
    # IP Assignment Management
    async def assign_ip(self, assignment_data: IPAssignmentCreate) -> IPAssignment:
        """
        Assign an IP address to a device with comprehensive validation.
        
        Validates:
        - IP is within VLAN subnet
        - IP is not reserved (first 6 + last)
        - IP is not already assigned
        - MAC address uniqueness
        """
        vlan = await self.get_vlan(assignment_data.vlan_id)
        
        # Validate IP is within VLAN subnet
        try:
            ip_addr = ipaddress.IPv4Address(assignment_data.ip_address)
            vlan_network = ipaddress.IPv4Network(f"{vlan.subnet}/{vlan.netmask}", strict=False)
            
            if ip_addr not in vlan_network:
                raise IPAllocationError(f"IP {assignment_data.ip_address} not in VLAN subnet {vlan_network}")
        except ipaddress.AddressValueError as e:
            raise IPAllocationError(f"Invalid IP address: {e}") from e
        
        # Check if IP is assignable (not reserved)
        if not self.ip_calculator.is_ip_assignable(ip_addr, vlan_network):
            raise ReservedIPError(f"IP {assignment_data.ip_address} is reserved and cannot be assigned")
        
        # Check for existing assignment
        existing_ip = self.db.query(IPAssignment).filter(
            IPAssignment.ip_address == assignment_data.ip_address
        ).first()
        if existing_ip:
            raise IPAllocationError(f"IP {assignment_data.ip_address} already assigned")
        
        # Check MAC address uniqueness if provided
        if assignment_data.mac_address:
            existing_mac = self.db.query(IPAssignment).filter(
                IPAssignment.mac_address == assignment_data.mac_address
            ).first()
            if existing_mac:
                raise IPAllocationError(f"MAC address {assignment_data.mac_address} already assigned")
        
        # Create assignment
        assignment = IPAssignment(**assignment_data.model_dump())
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        
        logger.info(f"Assigned IP {assignment.ip_address} to {assignment.ci_name}")
        return assignment
    
    async def get_next_available_ip(self, vlan_id: UUID) -> Optional[str]:
        """Get the next available IP address in a VLAN."""
        vlan = await self.get_vlan(vlan_id)
        
        # Get all assigned IPs in this VLAN
        assigned_ips = self.db.query(IPAssignment.ip_address).filter(
            and_(
                IPAssignment.vlan_id == vlan_id,
                IPAssignment.is_active == True
            )
        ).all()
        assigned_set = {ip[0] for ip in assigned_ips}
        
        # Generate available IPs
        try:
            vlan_network = ipaddress.IPv4Network(f"{vlan.subnet}/{vlan.netmask}", strict=False)
            
            for host_ip in vlan_network.hosts():
                if (str(host_ip) not in assigned_set and 
                    self.ip_calculator.is_ip_assignable(host_ip, vlan_network)):
                    return str(host_ip)
                    
        except Exception as e:
            logger.error(f"Error finding available IP: {e}")
            return None
        
        return None
    
    async def get_ip_availability(self, vlan_id: UUID) -> IPAvailabilityResponse:
        """Get IP availability statistics for a VLAN."""
        vlan = await self.get_vlan(vlan_id)
        
        # Calculate total IPs
        try:
            vlan_network = ipaddress.IPv4Network(f"{vlan.subnet}/{vlan.netmask}", strict=False)
            total_hosts = vlan_network.num_addresses - 2  # Exclude network and broadcast
            
            # Count reserved IPs
            reserved_count = (
                self.ip_calculator.RESERVED_START_COUNT + 
                self.ip_calculator.RESERVED_END_COUNT
            )
            
            # Count assigned IPs
            assigned_count = self.db.query(IPAssignment).filter(
                and_(
                    IPAssignment.vlan_id == vlan_id,
                    IPAssignment.is_active == True
                )
            ).count()
            
            assignable_total = total_hosts - reserved_count
            available_count = assignable_total - assigned_count
            utilization = (assigned_count / assignable_total * 100) if assignable_total > 0 else 0
            
            return IPAvailabilityResponse(
                vlan_id=vlan_id,
                total_ips=total_hosts,
                assigned_ips=assigned_count,
                available_ips=available_count,
                reserved_ips=reserved_count,
                utilization_percentage=round(utilization, 2)
            )
            
        except Exception as e:
            logger.error(f"Error calculating IP availability: {e}")
            raise VLANConfigurationError(f"Failed to calculate IP availability: {e}") from e
    
    async def release_ip(self, assignment_id: UUID) -> bool:
        """Release an IP assignment."""
        assignment = self.db.query(IPAssignment).filter(IPAssignment.id == assignment_id).first()
        if not assignment:
            return False
        
        assignment.is_active = False
        self.db.commit()
        
        logger.info(f"Released IP {assignment.ip_address} from {assignment.ci_name}")
        return True
    
    # Audit and Reporting
    async def get_network_hierarchy(self, domain_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Get complete network hierarchy for reporting."""
        query = self.db.query(Domain)
        if domain_id:
            query = query.filter(Domain.id == domain_id)
        
        domains = query.all()
        
        hierarchy = []
        for domain in domains:
            domain_data = {
                "domain": domain,
                "value_streams": []
            }
            
            for vs in domain.value_streams:
                vs_data = {
                    "value_stream": vs,
                    "zones": []
                }
                
                for zone in vs.zones:
                    zone_data = {
                        "zone": zone,
                        "vlans": zone.vlans
                    }
                    vs_data["zones"].append(zone_data)
                
                domain_data["value_streams"].append(vs_data)
            
            hierarchy.append(domain_data)
        
        return {"hierarchy": hierarchy}
    
    async def get_security_compliance_report(self) -> Dict[str, Any]:
        """Generate security compliance report for audit purposes."""
        zones_by_security = {}
        
        for security_type in SecurityType:
            zones = self.db.query(Zone).filter(Zone.security_type == security_type.value).all()
            zones_by_security[security_type.value] = {
                "count": len(zones),
                "zones": zones,
                "last_firewall_checks": [
                    {
                        "zone_name": zone.name,
                        "last_check": zone.last_firewall_check,
                        "overdue": (
                            zone.last_firewall_check is None or
                            (datetime.utcnow() - zone.last_firewall_check).days > 30
                        ) if zone.last_firewall_check else True
                    }
                    for zone in zones
                ]
            }
        
        return {
            "security_zones": zones_by_security,
            "compliance_summary": {
                "total_zones": sum(data["count"] for data in zones_by_security.values()),
                "overdue_firewall_checks": sum(
                    sum(1 for check in data["last_firewall_checks"] if check["overdue"])
                    for data in zones_by_security.values()
                )
            }
        }