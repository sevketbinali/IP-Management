# Project Structure

## Current Structure
```
IP-Management/
├── .git/                   # Git version control
├── .kiro/                  # Kiro AI assistant configuration
│   ├── settings/           # Kiro settings and MCP configurations
│   └── steering/           # AI guidance documents
├── .vscode/                # VS Code workspace settings
├── .gitignore              # Git ignore patterns (Python-focused)
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

## Recommended Future Structure
As the project develops, consider this organization:

```
IP-Management/
├── src/                    # Source code
│   ├── ip_management/      # Main package
│   │   ├── __init__.py
│   │   ├── core/           # Core business logic
│   │   ├── models/         # Data models
│   │   ├── services/       # Service layer
│   │   ├── api/            # API endpoints
│   │   └── utils/          # Utility functions
│   └── tests/              # Test files
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── config/                 # Configuration files
├── requirements/           # Dependency files
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── pyproject.toml          # Project configuration
└── README.md
```

## Naming Conventions
- **Packages/Modules**: snake_case (e.g., `ip_management`, `vlan_config`)
- **Classes**: PascalCase (e.g., `DeviceManager`, `VlanSegment`)
- **Functions/Variables**: snake_case (e.g., `get_device_ip`, `vlan_id`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SUBNET`, `MAX_DEVICES`)

## File Organization Principles
- **Separation of Concerns**: Keep business logic, data models, and API layers separate
- **Domain-Driven**: Organize by business domain (devices, vlans, networks)
- **Testability**: Mirror source structure in tests directory
- **Configuration**: Centralize configuration management

## Key Directories (Future)
- `src/ip_management/core/` - Core IP and VLAN management logic
- `src/ip_management/models/` - Device, Network, VLAN data models
- `src/ip_management/services/` - Business services and orchestration
- `src/ip_management/api/` - REST API or CLI interfaces
- `tests/` - Unit and integration tests
- `docs/` - Technical documentation and API specs