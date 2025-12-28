"""
Domain management API endpoints.

Handles top-level organizational units (MFG, LOG, FCM, ENG)
with full CRUD operations and validation.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService
from ...models.schemas import Domain, DomainCreate, DomainUpdate
from ...models.exceptions import DomainNotFoundError, VLANConfigurationError

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.post("/domains", response_model=Domain, status_code=status.HTTP_201_CREATED)
async def create_domain(
    domain_data: DomainCreate,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Create a new domain.
    
    Domains represent major business areas:
    - MFG: Manufacturing
    - LOG: Logistics  
    - FCM: Facility Management
    - ENG: Engineering
    """
    try:
        return await service.create_domain(domain_data)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/domains", response_model=List[Domain])
async def list_domains(
    active_only: bool = True,
    service: IPManagementService = Depends(get_ip_service)
):
    """List all domains with optional filtering by active status."""
    return await service.list_domains(active_only=active_only)


@router.get("/domains/{domain_id}", response_model=Domain)
async def get_domain(
    domain_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get domain details by ID."""
    try:
        return await service.get_domain(domain_id)
    except DomainNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )