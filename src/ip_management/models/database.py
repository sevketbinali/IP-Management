"""
Database models for IP management system.

Implements the hierarchical structure: Domain → Value Stream → Zone → VLAN → IP
with proper relationships and constraints for industrial IT/OT environments.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
import uuid

from sqlalchemy import (
    Column, String, Integer, DateTime, Boolean, Text, ForeignKey,
    UniqueConstraint, CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, INET, MACADDR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func


Base = declarative_base()


class SecurityType(str, Enum):
    """Security zone types according to Bosch Rexroth standards."""
    SL3_SECURE_BCN = "SL3"
    MFZ_SL4 = "MFZ_SL4"  # Manufacturing Zone
    LOG_SL4 = "LOG_SL4"  # Logistics Zone
    FMZ_SL4 = "FMZ_SL4"  # Facility Zone
    ENG_SL4 = "ENG_SL4"  # Engineering Zone
    LRSZ_SL4 = "LRSZ_SL4"  # Local Restricted Zone
    RSZ_SL4 = "RSZ_SL4"  # Restricted Zone


class Domain(Base):
    """
    Top-level organizational unit (MFG, LOG, FCM, ENG).
    
    Represents major business domains within the factory.
    """
    __tablename__ = "domains"
    
    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = Column(String(10), unique=True, nullable=False, index=True)
    name: Mapped[str] = Column(String(100), nullable=False)
    description: Mapped[Optional[str]] = Column(Text)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    value_streams: Mapped[List["ValueStream"]] = relationship(
        "ValueStream", back_populates="domain", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Domain(code='{self.code}', name='{self.name}')>"


class ValueStream(Base):
    """
    Value streams within domains (A2, A4, A6, A10, MCO, LOG21, etc.).
    
    Represents specific production lines or operational areas.
    """
    __tablename__ = "value_streams"
    
    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("domains.id"), nullable=False)
    code: Mapped[str] = Column(String(20), nullable=False, index=True)
    name: Mapped[str] = Column(String(100), nullable=False)
    description: Mapped[Optional[str]] = Column(Text)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    domain: Mapped["Domain"] = relationship("Domain", back_populates="value_streams")
    zones: Mapped[List["Zone"]] = relationship(
        "Zone", back_populates="value_stream", cascade="all, delete-orphan"
    )
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("domain_id", "code", name="uq_value_stream_domain_code"),
        Index("ix_value_stream_domain_code", "domain_id", "code"),
    )
    
    def __repr__(self) -> str:
        return f"<ValueStream(code='{self.code}', domain='{self.domain.code if self.domain else None}')>"


class Zone(Base):
    """
    Security zones with specific security types and network segments.
    
    Maps to physical or logical network zones with security classifications.
    """
    __tablename__ = "zones"
    
    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    value_stream_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("value_streams.id"), nullable=False)
    name: Mapped[str] = Column(String(100), nullable=False)
    security_type: Mapped[SecurityType] = Column(String(20), nullable=False)
    zone_manager: Mapped[Optional[str]] = Column(String(100))
    description: Mapped[Optional[str]] = Column(Text)
    last_firewall_check: Mapped[Optional[datetime]] = Column(DateTime(timezone=True))
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    value_stream: Mapped["ValueStream"] = relationship("ValueStream", back_populates="zones")
    vlans: Mapped[List["VLAN"]] = relationship(
        "VLAN", back_populates="zone", cascade="all, delete-orphan"
    )
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "security_type IN ('SL3', 'MFZ_SL4', 'LOG_SL4', 'FMZ_SL4', 'ENG_SL4', 'LRSZ_SL4', 'RSZ_SL4')",
            name="ck_zone_security_type"
        ),
        Index("ix_zone_security_type", "security_type"),
        Index("ix_zone_value_stream", "value_stream_id"),
    )
    
    def __repr__(self) -> str:
        return f"<Zone(name='{self.name}', security_type='{self.security_type}')>"


class VLAN(Base):
    """
    VLAN configuration with network parameters and IP management.
    
    Contains all network configuration for a specific VLAN segment.
    """
    __tablename__ = "vlans"
    
    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    zone_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=False)
    vlan_id: Mapped[int] = Column(Integer, nullable=False)
    subnet: Mapped[str] = Column(INET, nullable=False)
    netmask: Mapped[str] = Column(String(15), nullable=False)  # e.g., "255.255.255.0"
    default_gateway: Mapped[str] = Column(INET, nullable=False)
    net_start: Mapped[str] = Column(INET, nullable=False)  # First assignable IP
    net_end: Mapped[str] = Column(INET, nullable=False)    # Last assignable IP
    description: Mapped[Optional[str]] = Column(Text)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    zone: Mapped["Zone"] = relationship("Zone", back_populates="vlans")
    ip_assignments: Mapped[List["IPAssignment"]] = relationship(
        "IPAssignment", back_populates="vlan", cascade="all, delete-orphan"
    )
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("vlan_id", name="uq_vlan_id"),
        CheckConstraint("vlan_id >= 1 AND vlan_id <= 4094", name="ck_vlan_id_range"),
        Index("ix_vlan_zone", "zone_id"),
        Index("ix_vlan_subnet", "subnet"),
    )
    
    def __repr__(self) -> str:
        return f"<VLAN(id={self.vlan_id}, subnet='{self.subnet}')>"


class IPAssignment(Base):
    """
    Individual IP address assignments to devices.
    
    Tracks which devices are assigned which IP addresses within VLANs.
    """
    __tablename__ = "ip_assignments"
    
    id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vlan_id: Mapped[uuid.UUID] = Column(UUID(as_uuid=True), ForeignKey("vlans.id"), nullable=False)
    ip_address: Mapped[str] = Column(INET, nullable=False)
    mac_address: Mapped[Optional[str]] = Column(MACADDR)
    ci_name: Mapped[str] = Column(String(100), nullable=False)  # Configuration Item Name
    description: Mapped[Optional[str]] = Column(Text)
    is_reserved: Mapped[bool] = Column(Boolean, default=False, nullable=False)
    assigned_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    last_seen: Mapped[Optional[datetime]] = Column(DateTime(timezone=True))
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vlan: Mapped["VLAN"] = relationship("VLAN", back_populates="ip_assignments")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint("ip_address", name="uq_ip_address"),
        UniqueConstraint("mac_address", name="uq_mac_address"),
        Index("ix_ip_vlan", "vlan_id"),
        Index("ix_ip_address", "ip_address"),
        Index("ix_ci_name", "ci_name"),
    )
    
    def __repr__(self) -> str:
        return f"<IPAssignment(ip='{self.ip_address}', ci_name='{self.ci_name}')>"


# Database triggers and functions would be added here for:
# 1. Preventing assignment of reserved IPs
# 2. Automatic IP validation against VLAN subnet
# 3. Audit logging for all changes
# 4. Automatic cleanup of inactive assignments