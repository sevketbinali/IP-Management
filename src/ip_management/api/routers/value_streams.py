"""
Value Stream management API endpoints.

Handles production lines and operational areas within domains
(A2, A4, A6, A10, MCO, LOG21, etc.).
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService
from ...models.schemas import ValueStream, ValueStreamCreate, ValueStreamUpdate
from ...models.exceptions import ValueStreamNotFoundError, VLANConfigurationError

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.post("/value-streams", response_model=ValueStream, status_code=status.HTTP_201_CREATED)
async def create_value_stream(
    vs_data: ValueStreamCreate,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Create a new value stream within a domain.
    
    Value streams represent specific production lines or operational areas:
    - Manufacturing: A2, A4, A6, A10, MCO
    - Logistics: LOG21
    - Facility: Analyzers, Cameras, Building Systems
    - Engineering: Test Benches
    """
    try:
        return await service.create_value_stream(vs_data)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/value-streams/{vs_id}", response_model=ValueStream)
async def get_value_stream(
    vs_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get value stream details by ID."""
    try:
        return await service.get_value_stream(vs_id)
    except ValueStreamNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )