"""
IP Assignment management API endpoints.

Handles device IP allocations with comprehensive validation
and reserved IP protection.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...config.database import get_db
from ...services.ip_service import IPManagementService
from ...models.schemas import IPAssignment, IPAssignmentCreate, IPAssignmentUpdate
from ...models.exceptions import IPAllocationError, ReservedIPError

router = APIRouter()


def get_ip_service(db: Session = Depends(get_db)) -> IPManagementService:
    """Dependency to get IP management service."""
    return IPManagementService(db)


@router.post("/ip-assignments", response_model=IPAssignment, status_code=status.HTTP_201_CREATED)
async def assign_ip(
    assignment_data: IPAssignmentCreate,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Assign an IP address to a device.
    
    Validates:
    - IP is within VLAN subnet range
    - IP is not reserved (first 6 + last IP)
    - IP is not already assigned
    - MAC address uniqueness (if provided)
    
    Required fields:
    - vlan_id: Target VLAN for assignment
    - ip_address: IP to assign
    - ci_name: Configuration Item (device) name
    
    Optional fields:
    - mac_address: Device MAC address
    - description: Assignment description
    """
    try:
        return await service.assign_ip(assignment_data)
    except (IPAllocationError, ReservedIPError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/ip-assignments/{assignment_id}", response_model=IPAssignment)
async def get_ip_assignment(
    assignment_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """Get IP assignment details by ID."""
    # This would need to be implemented in the service
    pass


@router.put("/ip-assignments/{assignment_id}", response_model=IPAssignment)
async def update_ip_assignment(
    assignment_id: UUID,
    update_data: IPAssignmentUpdate,
    service: IPManagementService = Depends(get_ip_service)
):
    """Update IP assignment details (MAC, CI name, description)."""
    # This would need to be implemented in the service
    pass


@router.delete("/ip-assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def release_ip_assignment(
    assignment_id: UUID,
    service: IPManagementService = Depends(get_ip_service)
):
    """
    Release an IP assignment.
    
    Marks the assignment as inactive, making the IP available for reuse.
    Does not delete the assignment record for audit purposes.
    """
    try:
        success = await service.release_ip(assignment_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP assignment not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to release IP assignment: {str(e)}"
        )


@router.get("/vlans/{vlan_id}/ip-assignments", response_model=List[IPAssignment])
async def list_vlan_ip_assignments(
    vlan_id: UUID,
    active_only: bool = Query(True, description="Show only active assignments"),
    service: IPManagementService = Depends(get_ip_service)
):
    """
    List all IP assignments for a specific VLAN.
    
    Useful for the IP Management page showing:
    - CI Name
    - MAC Address  
    - IP Address
    - Description
    """
    # This would need to be implemented in the service
    pass