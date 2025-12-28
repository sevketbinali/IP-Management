"""
Zone management API endpoints.

Handles security zones with specific security classifications
and firewall rule management.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService
from ...models.schemas import Zone, ZoneCreate, ZoneUpdate
from ...models.exceptions import ZoneNotFoundError, VLANConfigurationError

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.post("/zones", response_model=Zone, status_code=status.HTTP_201_CREATED)
async def create_zone(
    zone_data: ZoneCreate,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Create a new security zone.
    
    Security Types:
    - SL3: Secure BCN (Office Network, Server Network)
    - MFZ_SL4: Manufacturing Zone
    - LOG_SL4: Logistics Zone
    - FMZ_SL4: Facility Zone
    - ENG_SL4: Engineering Zone
    - LRSZ_SL4: Local Restricted Zone (Nexeed MES, SQL, Docker)
    - RSZ_SL4: Restricted Zone
    """
    try:
        return await service.create_zone(zone_data)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/zones/{zone_id}", response_model=Zone)
async def get_zone(
    zone_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get zone details by ID."""
    try:
        return await service.get_zone(zone_id)
    except ZoneNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.patch("/zones/{zone_id}/firewall-check", response_model=Zone)
async def update_firewall_check(
    zone_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Update the last firewall rule check timestamp for a zone.
    
    Used for compliance tracking - zones should have firewall rules
    reviewed at least every 30 days per Bosch Rexroth security standards.
    """
    try:
        return await service.update_firewall_check(zone_id)
    except ZoneNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )