-- Database initialization script for IP Management System
-- Creates necessary extensions and initial configuration

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create custom types for network data if needed
DO $$
BEGIN
    -- Create enum for security types if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'security_type') THEN
        CREATE TYPE security_type AS ENUM (
            'SL3',
            'MFZ_SL4',
            'LOG_SL4', 
            'FMZ_SL4',
            'ENG_SL4',
            'LRSZ_SL4',
            'RSZ_SL4'
        );
    END IF;
END
$$;

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- Create index on audit log for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_values)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_values)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
INSERT INTO audit_log (table_name, operation, new_values) 
VALUES ('system', 'INIT', '{"message": "Database initialized", "version": "1.0.0"}');

-- Display initialization message
DO $$
BEGIN
    RAISE NOTICE 'IP Management System database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, citext';
    RAISE NOTICE 'Audit logging configured';
END
$$;