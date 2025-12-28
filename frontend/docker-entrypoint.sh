#!/bin/sh
# Docker entrypoint script for frontend container
# Handles runtime environment variable injection

set -e

# Function to replace environment variables in built files
replace_env_vars() {
    echo "Replacing environment variables in built files..."
    
    # Replace API URL if provided at runtime
    if [ ! -z "$REACT_APP_API_URL" ]; then
        find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" {} \;
        echo "API URL set to: $REACT_APP_API_URL"
    fi
    
    # Replace Plant Code if provided at runtime
    if [ ! -z "$REACT_APP_PLANT_CODE" ]; then
        find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_PLANT_CODE_PLACEHOLDER|$REACT_APP_PLANT_CODE|g" {} \;
        echo "Plant Code set to: $REACT_APP_PLANT_CODE"
    fi
    
    # Replace Organization if provided at runtime
    if [ ! -z "$REACT_APP_ORGANIZATION" ]; then
        find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_ORGANIZATION_PLACEHOLDER|$REACT_APP_ORGANIZATION|g" {} \;
        echo "Organization set to: $REACT_APP_ORGANIZATION"
    fi
}

# Replace environment variables
replace_env_vars

# Execute the main command
exec "$@"