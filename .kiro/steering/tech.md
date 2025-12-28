# Technology Stack

## Primary Language
- **Python** - Core development language based on .gitignore patterns

## Development Environment
- **VS Code** - Primary IDE with Kiro AI assistant integration
- **Git** - Version control system

## Package Management
The project supports multiple Python package managers:
- **UV** - Modern Python package manager (recommended)
- **Poetry** - Alternative package manager
- **Pipenv** - Alternative package manager
- **PDM** - Alternative package manager
- **Pixi** - Cross-platform package manager

## Development Tools
- **Ruff** - Python linter and formatter
- **MyPy** - Static type checking
- **Pytest** - Testing framework (inferred from .gitignore)

## Project Status
- **Early Stage** - Project is in initial development phase
- No source code or configuration files present yet
- Ready for initial architecture and implementation

## Common Commands
*Note: Commands will be added as the project develops*

```bash
# Package management (when using UV)
uv install              # Install dependencies
uv add <package>        # Add new dependency
uv run <command>        # Run commands in virtual environment

# Development
ruff check              # Lint code
ruff format             # Format code
mypy .                  # Type checking
pytest                  # Run tests
```

## Environment Files
- `.env` - Environment variables (gitignored)
- `.envrc` - direnv configuration (gitignored)