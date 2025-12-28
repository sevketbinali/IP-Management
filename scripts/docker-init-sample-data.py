#!/usr/bin/env python3
"""
Docker-optimized sample data initialization script.

Creates realistic sample data for Bosch Rexroth Bursa factory
with proper error handling and Docker environment compatibility.
"""

import asyncio
import sys
import os
import logging
from pathlib import Path

# Configure logging for Docker environment
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Add src to Python path for Docker environment
sys.path.insert(0, '/app/src')

try:
    from sqlalchemy.orm import Session
    from ip_management.config.database import SessionLocal
    from ip_management.services.ip_service import IPManagementService
    from ip_management.models.schemas import (
        DomainCreate, ValueStreamCreate, ZoneCreate, VLANCreate, IPAssignmentCreate
    )
except ImportError as e:
    logger.error(f"Failed to import required modules: {e}")
    logger.error("Make sure the application is properly built and dependencies are installed")
    sys.exit(1)


async def wait_for_database(max_retries=30, delay=2):
    """Wait for database to be ready."""
    for attempt in range(max_retries):
        try:
            db = SessionLocal()
            db.execute("SELECT 1")
            db.close()
            logger.info("Database connection successful")
            return True
        except Exception as e:
            logger.warning(f"Database not ready (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
            else:
                logger.error("Database connection failed after all retries")
                return False
    return False


async def create_sample_data():
    """Create comprehensive sample data for Bosch Rexroth factory."""
    
    # Wait for database to be ready
    if not await wait_for_database():
        logger.error("Cannot connect to database. Exiting.")
        sys.exit(1)
    
    db = SessionLocal()
    service = IPManagementService(db)
    
    try:
        logger.info("🏭 Creating Bosch Rexroth Bursa Factory Sample Data")
        logger.info("=" * 55)
        
        # Create Domains
        domains_data = [
            {"code": "MFG", "name": "Manufacturing", "description": "Manufacturing operations and production lines"},
            {"code": "LOG", "name": "Logistics", "description": "Logistics and material handling systems"},
            {"code": "FCM", "name": "Facility Management", "description": "Building systems, analyzers, and cameras"},
            {"code": "ENG", "name": "Engineering", "description": "Engineering test benches and development systems"}
        ]
        
        domains = {}
        for domain_data in domains_data:
            try:
                domain = await service.create_domain(DomainCreate(**domain_data))
                domains[domain.code] = domain
                logger.info(f"✅ Created domain: {domain.code} - {domain.name}")
            except Exception as e:
                logger.warning(f"⚠️  Domain {domain_data['code']} may already exist: {e}")
                # Try to get existing domain
                existing_domains = await service.list_domains(active_only=False)
                for existing in existing_domains:
                    if existing.code == domain_data['code']:
                        domains[existing.code] = existing
                        logger.info(f"📋 Using existing domain: {existing.code}")
                        break
        
        # Create Value Streams
        value_streams_data = [
            # Manufacturing Value Streams
            {"domain": "MFG", "code": "A2", "name": "Assembly Line A2", "description": "Main hydraulic component assembly"},
            {"domain": "MFG", "code": "A4", "name": "Assembly Line A4", "description": "Pneumatic component assembly"},
            {"domain": "MFG", "code": "A6", "name": "Assembly Line A6", "description": "Electronic control unit assembly"},
            {"domain": "MFG", "code": "A10", "name": "Assembly Line A10", "description": "Final product assembly and testing"},
            {"domain": "MFG", "code": "MCO", "name": "Manufacturing Control Office", "description": "Central manufacturing control and monitoring"},
            
            # Logistics Value Streams
            {"domain": "LOG", "code": "LOG21", "name": "Logistics Zone 21", "description": "Automated warehouse and material handling"},
            
            # Facility Value Streams
            {"domain": "FCM", "code": "ANALYZER", "name": "Process Analyzers", "description": "Chemical and quality analysis systems"},
            {"domain": "FCM", "code": "CAMERA", "name": "Security Cameras", "description": "Facility security and monitoring cameras"},
            {"domain": "FCM", "code": "BUILDING", "name": "Building Systems", "description": "HVAC, lighting, and building automation"},
            
            # Engineering Value Streams
            {"domain": "ENG", "code": "TESTBENCH", "name": "Test Benches", "description": "Product testing and validation systems"}
        ]
        
        value_streams = {}
        for vs_data in value_streams_data:
            domain_code = vs_data.pop("domain")
            if domain_code in domains:
                try:
                    vs = await service.create_value_stream(ValueStreamCreate(
                        domain_id=domains[domain_code].id,
                        **vs_data
                    ))
                    value_streams[f"{domain_code}_{vs.code}"] = vs
                    logger.info(f"✅ Created value stream: {domain_code}/{vs.code} - {vs.name}")
                except Exception as e:
                    logger.warning(f"⚠️  Value stream {domain_code}/{vs_data['code']} may already exist: {e}")
        
        # Create Zones with Security Types
        zones_data = [
            # Manufacturing Zones (MFZ_SL4)
            {"vs": "MFG_A2", "name": "Manufacturing Zone A2", "security_type": "MFZ_SL4", "zone_manager": "Hans Mueller"},
            {"vs": "MFG_A4", "name": "Manufacturing Zone A4", "security_type": "MFZ_SL4", "zone_manager": "Anna Schmidt"},
            {"vs": "MFG_A6", "name": "Manufacturing Zone A6", "security_type": "MFZ_SL4", "zone_manager": "Klaus Weber"},
            {"vs": "MFG_A10", "name": "Manufacturing Zone A10", "security_type": "MFZ_SL4", "zone_manager": "Maria Fischer"},
            {"vs": "MFG_MCO", "name": "Manufacturing Control Zone", "security_type": "SL3", "zone_manager": "Thomas Bauer"},
            
            # Logistics Zones (LOG_SL4)
            {"vs": "LOG_LOG21", "name": "Logistics Zone 21", "security_type": "LOG_SL4", "zone_manager": "Stefan Wagner"},
            
            # Facility Zones (FMZ_SL4)
            {"vs": "FCM_ANALYZER", "name": "Analyzer Zone", "security_type": "FMZ_SL4", "zone_manager": "Petra Hoffmann"},
            {"vs": "FCM_CAMERA", "name": "Security Camera Zone", "security_type": "FMZ_SL4", "zone_manager": "Michael Schulz"},
            {"vs": "FCM_BUILDING", "name": "Building Systems Zone", "security_type": "FMZ_SL4", "zone_manager": "Sabine Koch"},
            
            # Engineering Zones (ENG_SL4)
            {"vs": "ENG_TESTBENCH", "name": "Test Bench Zone", "security_type": "ENG_SL4", "zone_manager": "Robert Richter"},
            
            # Restricted Zones
            {"vs": "MFG_MCO", "name": "Nexeed MES Zone", "security_type": "LRSZ_SL4", "zone_manager": "Thomas Bauer"},
            {"vs": "MFG_MCO", "name": "SQL Database Zone", "security_type": "LRSZ_SL4", "zone_manager": "Thomas Bauer"},
            {"vs": "MFG_MCO", "name": "Docker Container Zone", "security_type": "LRSZ_SL4", "zone_manager": "Thomas Bauer"}
        ]
        
        zones = {}
        for zone_data in zones_data:
            vs_key = zone_data.pop("vs")
            if vs_key in value_streams:
                try:
                    zone = await service.create_zone(ZoneCreate(
                        value_stream_id=value_streams[vs_key].id,
                        **zone_data
                    ))
                    zones[f"{vs_key}_{zone.name.replace(' ', '_')}"] = zone
                    logger.info(f"✅ Created zone: {zone.name} ({zone.security_type})")
                except Exception as e:
                    logger.warning(f"⚠️  Zone {zone_data['name']} may already exist: {e}")
        
        # Create VLANs with realistic network segments
        vlans_data = [
            # Manufacturing VLANs (10.1.x.x range)
            {"zone_key": "MFG_A2_Manufacturing_Zone_A2", "vlan_id": 101, "subnet": "10.1.1.0", "netmask": "/24", "description": "Assembly Line A2 Network"},
            {"zone_key": "MFG_A4_Manufacturing_Zone_A4", "vlan_id": 102, "subnet": "10.1.2.0", "netmask": "/24", "description": "Assembly Line A4 Network"},
            {"zone_key": "MFG_A6_Manufacturing_Zone_A6", "vlan_id": 103, "subnet": "10.1.3.0", "netmask": "/24", "description": "Assembly Line A6 Network"},
            {"zone_key": "MFG_A10_Manufacturing_Zone_A10", "vlan_id": 104, "subnet": "10.1.4.0", "netmask": "/24", "description": "Assembly Line A10 Network"},
            {"zone_key": "MFG_MCO_Manufacturing_Control_Zone", "vlan_id": 110, "subnet": "10.1.10.0", "netmask": "/24", "description": "Manufacturing Control Network"},
            
            # Logistics VLANs (10.2.x.x range)
            {"zone_key": "LOG_LOG21_Logistics_Zone_21", "vlan_id": 201, "subnet": "10.2.1.0", "netmask": "/24", "description": "Logistics Zone 21 Network"},
            
            # Facility VLANs (10.3.x.x range)
            {"zone_key": "FCM_ANALYZER_Analyzer_Zone", "vlan_id": 301, "subnet": "10.3.1.0", "netmask": "/25", "description": "Process Analyzer Network"},
            {"zone_key": "FCM_CAMERA_Security_Camera_Zone", "vlan_id": 302, "subnet": "10.3.2.0", "netmask": "/24", "description": "Security Camera Network"},
            {"zone_key": "FCM_BUILDING_Building_Systems_Zone", "vlan_id": 303, "subnet": "10.3.3.0", "netmask": "/24", "description": "Building Automation Network"},
            
            # Engineering VLANs (10.4.x.x range)
            {"zone_key": "ENG_TESTBENCH_Test_Bench_Zone", "vlan_id": 401, "subnet": "10.4.1.0", "netmask": "/24", "description": "Test Bench Network"},
            
            # Restricted VLANs (10.5.x.x range)
            {"zone_key": "MFG_MCO_Nexeed_MES_Zone", "vlan_id": 501, "subnet": "10.5.1.0", "netmask": "/26", "description": "Nexeed MES Network"},
            {"zone_key": "MFG_MCO_SQL_Database_Zone", "vlan_id": 502, "subnet": "10.5.2.0", "netmask": "/27", "description": "SQL Database Network"},
            {"zone_key": "MFG_MCO_Docker_Container_Zone", "vlan_id": 503, "subnet": "10.5.3.0", "netmask": "/26", "description": "Docker Container Network"}
        ]
        
        vlans = {}
        for vlan_data in vlans_data:
            zone_key = vlan_data.pop("zone_key")
            if zone_key in zones:
                try:
                    vlan = await service.create_vlan(VLANCreate(
                        zone_id=zones[zone_key].id,
                        **vlan_data
                    ))
                    vlans[f"VLAN_{vlan.vlan_id}"] = vlan
                    logger.info(f"✅ Created VLAN {vlan.vlan_id}: {vlan.description}")
                except Exception as e:
                    logger.warning(f"⚠️  VLAN {vlan_data['vlan_id']} may already exist: {e}")
        
        # Create sample IP assignments
        ip_assignments_data = [
            # Manufacturing devices
            {"vlan": "VLAN_101", "ip": "10.1.1.10", "mac": "00:1B:21:A2:01:01", "ci_name": "PLC-A2-MAIN", "description": "Main PLC for Assembly Line A2"},
            {"vlan": "VLAN_101", "ip": "10.1.1.11", "mac": "00:1B:21:A2:01:02", "ci_name": "HMI-A2-OP1", "description": "Operator Panel 1 - Line A2"},
            {"vlan": "VLAN_101", "ip": "10.1.1.12", "mac": "00:1B:21:A2:01:03", "ci_name": "ROBOT-A2-R1", "description": "Assembly Robot 1 - Line A2"},
            
            {"vlan": "VLAN_102", "ip": "10.1.2.10", "mac": "00:1B:21:A4:01:01", "ci_name": "PLC-A4-MAIN", "description": "Main PLC for Assembly Line A4"},
            {"vlan": "VLAN_102", "ip": "10.1.2.11", "mac": "00:1B:21:A4:01:02", "ci_name": "HMI-A4-OP1", "description": "Operator Panel 1 - Line A4"},
            
            # Logistics devices
            {"vlan": "VLAN_201", "ip": "10.2.1.10", "mac": "00:1B:21:LOG:01:01", "ci_name": "WMS-LOG21-SRV", "description": "Warehouse Management Server"},
            {"vlan": "VLAN_201", "ip": "10.2.1.11", "mac": "00:1B:21:LOG:01:02", "ci_name": "AGV-LOG21-001", "description": "Automated Guided Vehicle 001"},
            
            # Facility devices
            {"vlan": "VLAN_301", "ip": "10.3.1.10", "mac": "00:1B:21:FCM:01:01", "ci_name": "ANALYZER-QC-001", "description": "Quality Control Analyzer 001"},
            {"vlan": "VLAN_302", "ip": "10.3.2.10", "mac": "00:1B:21:FCM:02:01", "ci_name": "CAMERA-SEC-001", "description": "Security Camera - Main Entrance"},
            {"vlan": "VLAN_302", "ip": "10.3.2.11", "mac": "00:1B:21:FCM:02:02", "ci_name": "CAMERA-SEC-002", "description": "Security Camera - Production Floor"},
            
            # Engineering devices
            {"vlan": "VLAN_401", "ip": "10.4.1.10", "mac": "00:1B:21:ENG:01:01", "ci_name": "TESTBENCH-TB001", "description": "Hydraulic Test Bench 001"},
            
            # Restricted zone devices
            {"vlan": "VLAN_501", "ip": "10.5.1.10", "mac": "00:1B:21:MES:01:01", "ci_name": "NEXEED-MES-SRV", "description": "Nexeed MES Server"},
            {"vlan": "VLAN_502", "ip": "10.5.2.10", "mac": "00:1B:21:SQL:01:01", "ci_name": "SQL-DB-PRIMARY", "description": "Primary SQL Database Server"},
            {"vlan": "VLAN_503", "ip": "10.5.3.10", "mac": "00:1B:21:DCK:01:01", "ci_name": "DOCKER-HOST-001", "description": "Docker Container Host 001"}
        ]
        
        ip_count = 0
        for ip_data in ip_assignments_data:
            vlan_key = ip_data.pop("vlan")
            if vlan_key in vlans:
                try:
                    assignment = await service.assign_ip(IPAssignmentCreate(
                        vlan_id=vlans[vlan_key].id,
                        ip_address=ip_data["ip"],
                        mac_address=ip_data["mac"],
                        ci_name=ip_data["ci_name"],
                        description=ip_data["description"]
                    ))
                    ip_count += 1
                    logger.info(f"✅ Assigned IP {assignment.ip_address} to {assignment.ci_name}")
                except Exception as e:
                    logger.warning(f"⚠️  IP {ip_data['ip']} may already be assigned: {e}")
        
        logger.info("\n🎉 Sample data creation completed successfully!")
        logger.info(f"📊 Created: {len(domains)} domains, {len(value_streams)} value streams, {len(zones)} zones, {len(vlans)} VLANs, {ip_count} IP assignments")
        logger.info("🌐 Ready for development and testing!")
        logger.info("\n🔗 Access the application:")
        logger.info("   Frontend: http://localhost:3000")
        logger.info("   API Docs: http://localhost:8000/api/docs")
        logger.info("   Health Check: http://localhost:8000/health")
        
    except Exception as e:
        logger.error(f"❌ Error creating sample data: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        asyncio.run(create_sample_data())
    except KeyboardInterrupt:
        logger.info("Sample data creation interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Sample data creation failed: {e}")
        sys.exit(1)