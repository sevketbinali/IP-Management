"""
Pydantic schemas for API request/response validation.

Provides type-safe data validation and serialization for all API endpoints.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
import ipaddress

from pydantic import BaseModel, Field, validator, ConfigDict
from .database import SecurityType


# Base schemas with common fields
class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields."""
    created_at: datetime
    updated_at: Optional[datetime] = None


# Domain schemas
class DomainBase(BaseSchema):
    """Base domain schema."""
    code: str = Field(..., min_length=1, max_length=10, description="Domain code (e.g., MFG, LOG)")
    name: str = Field(..., min_length=1, max_length=100, description="Domain name")
    description: Optional[str] = Field(None, description="Domain description")
    is_active: bool = Field(True, description="Whether domain is active")


class DomainCreate(DomainBase):
    """Schema for creating a domain."""
    pass


class DomainUpdate(BaseSchema):
    """Schema for updating a domain."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Domain(DomainBase, TimestampMixin):
    """Complete domain schema with relationships."""
    id: UUID
    value_streams: List["ValueStream"] = Field(default_factory=list)


# Value Stream schemas
class ValueStreamBase(BaseSchema):
    """Base value stream schema."""
    code: str = Field(..., min_length=1, max_length=20, description="Value stream code")
    name: str = Field(..., min_length=1, max_length=100, description="Value stream name")
    description: Optional[str] = Field(None, description="Value stream description")
    is_active: bool = Field(True, description="Whether value stream is active")


class ValueStreamCreate(ValueStreamBase):
    """Schema for creating a value stream."""
    domain_id: UUID = Field(..., description="Parent domain ID")


class ValueStreamUpdate(BaseSchema):
    """Schema for updating a value stream."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ValueStream(ValueStreamBase, TimestampMixin):
    """Complete value stream schema with relationships."""
    id: UUID
    domain_id: UUID
    zones: List["Zone"] = Field(default_factory=list)


# Zone schemas
class ZoneBase(BaseSchema):
    """Base zone schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Zone name")
    security_type: SecurityType = Field(..., description="Security classification")
    zone_manager: Optional[str] = Field(None, max_length=100, description="Zone manager name")
    description: Optional[str] = Field(None, description="Zone description")
    last_firewall_check: Optional[datetime] = Field(None, description="Last firewall rule check")
    is_active: bool = Field(True, description="Whether zone is active")


class ZoneCreate(ZoneBase):
    """Schema for creating a zone."""
    value_stream_id: UUID = Field(..., description="Parent value stream ID")


class ZoneUpdate(BaseSchema):
    """Schema for updating a zone."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    security_type: Optional[SecurityType] = None
    zone_manager: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    last_firewall_check: Optional[datetime] = None
    is_active: Optional[bool] = None


class Zone(ZoneBase, TimestampMixin):
    """Complete zone schema with relationships."""
    id: UUID
    value_stream_id: UUID
    vlans: List["VLAN"] = Field(default_factory=list)


# VLAN schemas
class VLANBase(BaseSchema):
    """Base VLAN schema."""
    vlan_id: int = Field(..., ge=1, le=4094, description="VLAN ID (1-4094)")
    subnet: str = Field(..., description="Network subnet (e.g., 192.168.1.0)")
    netmask: str = Field(..., description="Subnet mask (e.g., 255.255.255.0)")
    description: Optional[str] = Field(None, description="VLAN description")
    is_active: bool = Field(True, description="Whether VLAN is active")
    
    @validator('subnet')
    def validate_subnet(cls, v):
        """Validate subnet format."""
        try:
            ipaddress.IPv4Address(v)
            return v
        except ipaddress.AddressValueError:
            raise ValueError('Invalid subnet address format')
    
    @validator('netmask')
    def validate_netmask(cls, v):
        """Validate netmask format."""
        if v.startswith('/'):
            # CIDR notation
            try:
                prefix = int(v[1:])
                if not 0 <= prefix <= 32:
                    raise ValueError('CIDR prefix must be between 0 and 32')
                return v
            except ValueError:
                raise ValueError('Invalid CIDR notation')
        else:
            # Dotted decimal notation
            try:
                ipaddress.IPv4Address(v)
                return v
            except ipaddress.AddressValueError:
                raise ValueError('Invalid netmask format')


class VLANCreate(VLANBase):
    """Schema for creating a VLAN."""
    zone_id: UUID = Field(..., description="Parent zone ID")


class VLANUpdate(BaseSchema):
    """Schema for updating a VLAN."""
    description: Optional[str] = None
    is_active: Optional[bool] = None


class VLAN(VLANBase, TimestampMixin):
    """Complete VLAN schema with calculated fields."""
    id: UUID
    zone_id: UUID
    default_gateway: str = Field(..., description="Default gateway IP")
    net_start: str = Field(..., description="First assignable IP")
    net_end: str = Field(..., description="Last assignable IP")
    ip_assignments: List["IPAssignment"] = Field(default_factory=list)


# IP Assignment schemas
class IPAssignmentBase(BaseSchema):
    """Base IP assignment schema."""
    ip_address: str = Field(..., description="Assigned IP address")
    mac_address: Optional[str] = Field(None, description="Device MAC address")
    ci_name: str = Field(..., min_length=1, max_length=100, description="Configuration Item name")
    description: Optional[str] = Field(None, description="Assignment description")
    is_active: bool = Field(True, description="Whether assignment is active")
    
    @validator('ip_address')
    def validate_ip_address(cls, v):
        """Validate IP address format."""
        try:
            ipaddress.IPv4Address(v)
            return v
        except ipaddress.AddressValueError:
            raise ValueError('Invalid IP address format')
    
    @validator('mac_address')
    def validate_mac_address(cls, v):
        """Validate MAC address format."""
        if v is None:
            return v
        
        # Remove common separators and validate format
        mac_clean = v.replace(':', '').replace('-', '').replace('.', '').upper()
        if len(mac_clean) != 12 or not all(c in '0123456789ABCDEF' for c in mac_clean):
            raise ValueError('Invalid MAC address format')
        
        # Return in standard format
        return ':'.join(mac_clean[i:i+2] for i in range(0, 12, 2))


class IPAssignmentCreate(IPAssignmentBase):
    """Schema for creating an IP assignment."""
    vlan_id: UUID = Field(..., description="Parent VLAN ID")


class IPAssignmentUpdate(BaseSchema):
    """Schema for updating an IP assignment."""
    mac_address: Optional[str] = None
    ci_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class IPAssignment(IPAssignmentBase, TimestampMixin):
    """Complete IP assignment schema."""
    id: UUID
    vlan_id: UUID
    is_reserved: bool = Field(..., description="Whether IP is reserved")
    assigned_at: datetime = Field(..., description="Assignment timestamp")
    last_seen: Optional[datetime] = Field(None, description="Last seen timestamp")


# Response schemas for complex operations
class VLANCalculationResult(BaseSchema):
    """Result of VLAN subnet calculation."""
    vlan_id: int
    network: str
    subnet: str
    netmask: str
    default_gateway: str
    net_start: str
    net_end: str
    total_ips: int
    assignable_ips: int
    reserved_ranges: List[dict]


class IPAvailabilityResponse(BaseSchema):
    """IP availability information for a VLAN."""
    vlan_id: UUID
    total_ips: int
    assigned_ips: int
    available_ips: int
    reserved_ips: int
    utilization_percentage: float


class NetworkHierarchyResponse(BaseSchema):
    """Complete network hierarchy response."""
    domain: Domain
    value_streams: List[ValueStream]
    zones: List[Zone]
    vlans: List[VLAN]


# Update forward references
Domain.model_rebuild()
ValueStream.model_rebuild()
Zone.model_rebuild()
VLAN.model_rebuild()
IPAssignment.model_rebuild()