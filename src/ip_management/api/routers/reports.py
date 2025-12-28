"""
Reporting and analytics API endpoints.

Provides network hierarchy views, security compliance reports,
and operational dashboards for IT/OT network management.
"""

from typing import Dict, Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.get("/reports/network-hierarchy")
async def get_network_hierarchy(
    domain_id: Optional[UUID] = Query(None, description="Filter by specific domain"),
    service: IPManagementService = Depends(get_ip_service)
) -> Dict[str, Any]:
    """
    Get complete network hierarchy for visualization and reporting.
    
    Returns the full Domain → Value Stream → Zone → VLAN → IP structure
    for network topology understanding and documentation.
    """
    return await service.get_network_hierarchy(domain_id)


@router.get("/reports/security-compliance")
async def get_security_compliance_report(
    service: IPManagementService = Depends(get_ip_service)
) -> Dict[str, Any]:
    """
    Generate security compliance report for audit purposes.
    
    Includes:
    - Zones by security type
    - Firewall rule check status
    - Overdue compliance items
    - Security zone distribution
    
    Critical for Bosch Rexroth IT/OT security audits.
    """
    return await service.get_security_compliance_report()