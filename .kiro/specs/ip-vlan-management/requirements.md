# Requirements Document

## Introduction

The IP Management & VLAN Segmentation System is a critical infrastructure management platform designed for industrial production environments, specifically targeting IT/OT network convergence scenarios. The system manages device IP allocations, VLAN configurations, and network segmentation across multiple organizational domains within production facilities, with initial deployment at Bursa Bosch Rexroth Factory.

## Glossary

- **System**: The IP Management & VLAN Segmentation System
- **Domain**: Top-level organizational unit (MFG, LOG, FCM, ENG)
- **Value_Stream**: Business process grouping within a domain
- **Zone**: Network security boundary with defined security level
- **VLAN**: Virtual Local Area Network segment with specific subnet configuration
- **CI**: Configuration Item (network device requiring IP allocation)
- **Reserved_IP**: First 6 and last IP addresses in any subnet reserved for management
- **Security_Level**: Industrial security classification (SL3, MFZ_SL4, LOG_SL4, FMZ_SL4, ENG_SL4, LRSZ_SL4, RSZ_SL4)
- **Firewall_Rule**: Network access control rule requiring periodic validation
- **Auto_Allocation**: Automatic IP address assignment avoiding reserved ranges

## Requirements

### Requirement 1: Hierarchical Network Organization

**User Story:** As a network administrator, I want to organize network resources in a clear hierarchy, so that I can manage complex industrial networks systematically.

#### Acceptance Criteria

1. THE System SHALL implement a five-tier hierarchy: Domain → Value Stream → Zone → VLAN → IP
2. WHEN a user navigates the hierarchy, THE System SHALL display only valid child elements for the selected parent
3. THE System SHALL enforce referential integrity across all hierarchy levels
4. WHEN a parent element is deleted, THE System SHALL prevent deletion if child elements exist
5. THE System SHALL support the predefined domains: MFG, LOG, FCM, ENG

### Requirement 2: VLAN Definition and Management

**User Story:** As a network engineer, I want to define comprehensive VLAN configurations, so that I can establish proper network segmentation.

#### Acceptance Criteria

1. WHEN creating a VLAN, THE System SHALL require VLAN ID, subnet, subnet mask, default gateway, network start, network end, zone name, and zone manager
2. THE System SHALL validate that VLAN IDs are unique within their domain scope
3. THE System SHALL validate that subnet configurations are mathematically correct
4. THE System SHALL store the last firewall rule check date for each VLAN
5. WHEN subnet parameters are modified, THE System SHALL recalculate network boundaries automatically
6. THE System SHALL prevent VLAN subnet overlaps within the same security zone

### Requirement 3: Automatic IP Allocation with Reserved Management IPs

**User Story:** As a system administrator, I want automatic IP allocation with protected management ranges, so that I can prevent accidental allocation of critical management addresses.

#### Acceptance Criteria

1. WHEN allocating IPs automatically, THE System SHALL reserve the first 6 IP addresses in any subnet
2. WHEN allocating IPs automatically, THE System SHALL reserve the last IP address in any subnet
3. THE System SHALL only allocate IPs from the available range between reserved blocks
4. WHEN the available IP pool is exhausted, THE System SHALL notify the administrator and suggest subnet expansion
5. THE System SHALL prevent manual allocation of reserved IP addresses
6. THE System SHALL maintain an allocation history for audit purposes

### Requirement 4: IP Management Interface

**User Story:** As a network technician, I want to manage device IP assignments through an intuitive interface, so that I can efficiently configure network devices.

#### Acceptance Criteria

1. THE System SHALL provide an IP Management page with fields for CI Name, MAC Address, IP Address, and Description
2. WHEN saving IP assignments, THE System SHALL validate MAC address format
3. WHEN saving IP assignments, THE System SHALL validate IP address is within the VLAN subnet
4. THE System SHALL prevent duplicate IP address assignments within the same VLAN
5. THE System SHALL prevent duplicate MAC address registrations across the entire system
6. WHEN the Save button is clicked, THE System SHALL persist changes and provide confirmation feedback

### Requirement 5: Domain Management

**User Story:** As an IT manager, I want to manage organizational domains, so that I can align network structure with business organization.

#### Acceptance Criteria

1. THE System SHALL support the four predefined domains: MFG, LOG, FCM, ENG
2. WHEN creating domain configurations, THE System SHALL allow domain-specific settings and policies
3. THE System SHALL prevent deletion of domains that contain active value streams
4. THE System SHALL maintain domain-level access controls and permissions
5. THE System SHALL support domain-specific reporting and analytics

### Requirement 6: Value Stream Management

**User Story:** As a production manager, I want to manage value streams within domains, so that I can organize network resources by business processes.

#### Acceptance Criteria

1. THE System SHALL provide add, edit, and delete operations for value streams
2. WHEN creating a value stream, THE System SHALL require assignment to a valid domain
3. WHEN editing a value stream, THE System SHALL maintain referential integrity with child zones
4. WHEN deleting a value stream, THE System SHALL prevent deletion if zones are assigned
5. THE System SHALL support value stream naming conventions and validation rules

### Requirement 7: Zone Management with Security Classifications

**User Story:** As a security engineer, I want to manage zones with specific security levels, so that I can implement proper network segmentation according to industrial security standards.

#### Acceptance Criteria

1. THE System SHALL support the security types: SL3, MFZ_SL4, LOG_SL4, FMZ_SL4, ENG_SL4, LRSZ_SL4, RSZ_SL4
2. WHEN creating zones, THE System SHALL require security level assignment
3. THE System SHALL enforce security policies based on zone classification
4. THE System SHALL map zones to Secure and Restricted Secure network layers
5. THE System SHALL prevent cross-zone communication that violates security policies
6. THE System SHALL maintain audit logs for all zone security modifications

### Requirement 8: IP Address Operations with Protection

**User Story:** As a network administrator, I want to add, edit, and delete IP addresses with built-in protections, so that I can manage addresses safely without disrupting critical services.

#### Acceptance Criteria

1. THE System SHALL provide add, edit, and delete operations for IP addresses
2. WHEN adding IP addresses, THE System SHALL validate against reserved IP ranges
3. WHEN editing IP addresses, THE System SHALL check for conflicts before applying changes
4. WHEN deleting IP addresses, THE System SHALL verify the IP is not currently in use
5. THE System SHALL maintain a change log for all IP address operations
6. THE System SHALL provide rollback capability for IP address changes

### Requirement 9: VLAN Auto-Generation Logic

**User Story:** As a network architect, I want automatic VLAN generation based on subnet requirements, so that I can efficiently provision network segments.

#### Acceptance Criteria

1. WHEN subnet size requirements are specified, THE System SHALL calculate optimal VLAN configurations
2. THE System SHALL suggest VLAN ID assignments to avoid conflicts
3. THE System SHALL generate subnet boundaries based on device count projections
4. THE System SHALL account for reserved IP ranges in subnet sizing calculations
5. THE System SHALL provide preview functionality before applying auto-generated configurations

### Requirement 10: Data Persistence and Integrity

**User Story:** As a system administrator, I want reliable data storage with integrity checks, so that I can trust the system with critical network configuration data.

#### Acceptance Criteria

1. THE System SHALL persist all configuration data to a relational database
2. THE System SHALL implement database transactions for multi-table operations
3. THE System SHALL perform regular integrity checks on hierarchical relationships
4. THE System SHALL provide automated backup and recovery capabilities
5. THE System SHALL maintain referential integrity across all data relationships
6. THE System SHALL log all data modification operations with timestamps and user attribution

### Requirement 11: Security and Authentication Integration

**User Story:** As a security administrator, I want integration with enterprise authentication systems, so that I can maintain consistent access controls.

#### Acceptance Criteria

1. THE System SHALL integrate with Bosch IAM for user authentication
2. THE System SHALL implement role-based access control (RBAC)
3. THE System SHALL enforce TLS/SSL encryption for all communications
4. THE System SHALL maintain session security with appropriate timeout policies
5. THE System SHALL log all authentication and authorization events
6. THE System SHALL support multi-factor authentication where required

### Requirement 12: Scalability and Multi-Plant Support

**User Story:** As an enterprise architect, I want a scalable system design, so that I can expand to other Bosch plants without architectural changes.

#### Acceptance Criteria

1. THE System SHALL implement tenant isolation for multi-plant deployments
2. THE System SHALL support configuration templates for rapid plant onboarding
3. THE System SHALL provide centralized management with plant-specific views
4. THE System SHALL scale to support thousands of devices per plant
5. THE System SHALL maintain performance standards under high concurrent usage
6. THE System SHALL support distributed deployment architectures