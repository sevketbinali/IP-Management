"""Custom exceptions for IP management system."""


class IPManagementError(Exception):
    """Base exception for IP management system."""
    pass


class InvalidSubnetError(IPManagementError):
    """Raised when subnet configuration is invalid."""
    pass


class InsufficientIPSpaceError(IPManagementError):
    """Raised when subnet doesn't have enough IP addresses."""
    pass


class IPAllocationError(IPManagementError):
    """Raised when IP allocation fails."""
    pass


class ReservedIPError(IPManagementError):
    """Raised when attempting to assign a reserved IP."""
    pass


class VLANConfigurationError(IPManagementError):
    """Raised when VLAN configuration is invalid."""
    pass


class DomainNotFoundError(IPManagementError):
    """Raised when domain is not found."""
    pass


class ZoneNotFoundError(IPManagementError):
    """Raised when zone is not found."""
    pass


class ValueStreamNotFoundError(IPManagementError):
    """Raised when value stream is not found."""
    pass