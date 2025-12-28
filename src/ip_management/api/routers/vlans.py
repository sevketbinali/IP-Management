"""
VLAN management API endpoints.

Provides comprehensive VLAN configuration and IP calculation capabilities
for industrial network segmentation.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService
from ...models.schemas import (
    VLAN, VLANCreate, VLANUpdate, VLANCalculationResult, IPAvailabilityResponse
)
from ...models.exceptions import VLANConfigurationError

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.post("/vlans", response_model=VLAN, status_code=status.HTTP_201_CREATED)
async def create_vlan(
    vlan_data: VLANCreate,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Create a new VLAN with automatic IP calculation.
    
    Automatically calculates:
    - Default gateway (first host IP)
    - Assignable IP range (excluding reserved IPs)
    - Network validation and subnet verification
    
    Reserved IPs:
    - First 6 IPs: Management use (non-assignable)
    - Last IP: Management use (non-assignable)
    """
    try:
        return await service.create_vlan(vlan_data)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/vlans/{vlan_id}", response_model=VLAN)
async def get_vlan(
    vlan_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get VLAN details by ID."""
    try:
        return await service.get_vlan(vlan_id)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/vlans/calculate", response_model=VLANCalculationResult)
async def calculate_vlan_parameters(
    vlan_id: int,
    subnet: str,
    netmask: str,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Calculate VLAN network parameters without creating the VLAN.
    
    Useful for validation and preview before VLAN creation.
    Returns all calculated network parameters including reserved IP ranges.
    """
    try:
        return await service.calculate_vlan_parameters(vlan_id, subnet, netmask)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"VLAN calculation failed: {str(e)}"
        )


@router.get("/vlans/{vlan_id}/availability", response_model=IPAvailabilityResponse)
async def get_vlan_ip_availability(
    vlan_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Get IP availability statistics for a VLAN.
    
    Returns:
    - Total IPs in subnet
    - Assigned IPs count
    - Available IPs count
    - Reserved IPs count
    - Utilization percentage
    """
    try:
        return await service.get_ip_availability(vlan_id)
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/vlans/{vlan_id}/next-ip")
async def get_next_available_ip(
    vlan_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get the next available IP address in a VLAN."""
    try:
        next_ip = await service.get_next_available_ip(vlan_id)
        if next_ip:
            return {"next_available_ip": next_ip}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available IP addresses in this VLAN"
            )
    except VLANConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )