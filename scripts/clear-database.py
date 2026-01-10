#!/usr/bin/env python3
"""
Database cleanup script for IP Management System.

Clears all data from the database to allow fresh sample data initialization.
"""

import asyncio
import sys
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src"))

from sqlalchemy.orm import Session
from ip_management.config.database import SessionLocal
from ip_management.models.database import (
    Domain, ValueStream, Zone, VLAN, IPAssignment
)


async def clear_database():
    """Clear all data from the database."""
    db = SessionLocal()
    
    try:
        print("🧹 Clearing IP Management Database")
        print("=" * 35)
        
        # Delete in reverse dependency order
        ip_count = db.query(IPAssignment).count()
        db.query(IPAssignment).delete()
        print(f"✅ Cleared {ip_count} IP assignments")
        
        vlan_count = db.query(VLAN).count()
        db.query(VLAN).delete()
        print(f"✅ Cleared {vlan_count} VLANs")
        
        zone_count = db.query(Zone).count()
        db.query(Zone).delete()
        print(f"✅ Cleared {zone_count} zones")
        
        vs_count = db.query(ValueStream).count()
        db.query(ValueStream).delete()
        print(f"✅ Cleared {vs_count} value streams")
        
        domain_count = db.query(Domain).count()
        db.query(Domain).delete()
        print(f"✅ Cleared {domain_count} domains")
        
        db.commit()
        print("\n🎉 Database cleared successfully!")
        print("Ready for fresh sample data initialization.")
        
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(clear_database())