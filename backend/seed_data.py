#!/usr/bin/env python3
"""
Seed Data Script for Pool Maintenance App
Creates sample maintenance records for demonstration purposes
"""

import random
from datetime import datetime, timedelta
from app import app, db, Villa, MaintenanceRecord, FountainMaintenance

# Sample maintenance messages
SAMPLE_MESSAGES = [
    "507 pool chlorine 1.2 pH 7.5 temperature 28",
    "301 chlorine 0.8 pH 7.1 occupied",
    "605 maintenance complete pH 7.4 chlorine 1.5",
    "702 fountain nozzle broken need repair",
    "501 fountain pump not working",
    "308 fountain filter needs cleaning",
    "201 pool cleaned pH 7.3 chlorine 1.1",
    "409 vacant clean ready for guest",
    "801 occupied guest checked in",
    "112 pool maintenance pH 7.0 chlorine 1.3 temperature 27",
    "607 low chlorine level 0.6 pH 7.2",
    "903 fountain leak detected needs repair",
    "505 pool cleaning complete pH 7.6 chlorine 1.4",
    "710 vacant dirty needs cleaning",
    "304 temperature high 32 degrees",
]

def create_sample_maintenance_records():
    """Create sample maintenance records"""
    print("Creating sample maintenance records...")
    
    # Get all villas
    villas = Villa.query.all()
    
    # Create records for the last 30 days
    for i in range(50):  # Create 50 sample records
        villa = random.choice(villas)
        
        # Random date within last 30 days
        days_ago = random.randint(0, 30)
        timestamp = datetime.now() - timedelta(days=days_ago, 
                                                hours=random.randint(8, 18),
                                                minutes=random.randint(0, 59))
        
        # Generate random maintenance data
        chlorine_level = round(random.uniform(0.5, 2.0), 1)
        ph_level = round(random.uniform(6.8, 8.0), 1)
        temperature = round(random.uniform(24, 32), 1)
        
        # Random status
        statuses = ['VD', 'VC', 'OCC']
        status = random.choice(statuses)
        
        # Staff names
        staff_names = ['John', 'Maria', 'Ahmed', 'Sarah', 'Carlos', 'Elena']
        staff_name = random.choice(staff_names)
        
        # Create maintenance record
        record = MaintenanceRecord(
            villa_id=villa.id,
            timestamp=timestamp,
            chlorine_level=chlorine_level,
            ph_level=ph_level,
            temperature=temperature,
            status=status,
            notes=f"Villa {villa.villa_number} maintenance - Chlorine: {chlorine_level}ppm, pH: {ph_level}",
            staff_name=staff_name,
            time_in=timestamp,
            time_out=timestamp + timedelta(minutes=random.randint(15, 45))
        )
        
        db.session.add(record)
    
    db.session.commit()
    print(f"✅ Created {MaintenanceRecord.query.count()} maintenance records")

def create_sample_fountain_issues():
    """Create sample fountain maintenance issues"""
    print("Creating sample fountain issues...")
    
    # Get random villas
    villas = Villa.query.all()
    
    fountain_issues = [
        "Fountain nozzle clogged - needs cleaning",
        "Pump motor making unusual noise",
        "Water level sensor malfunction",
        "Filter needs replacement",
        "Fountain lights not working",
        "Water circulation problem",
        "Fountain timer not working",
        "Decorative stones displaced",
        "Fountain overflow issue",
        "Water quality concerns"
    ]
    
    for i in range(10):  # Create 10 fountain issues
        villa = random.choice(villas)
        
        # Random date within last 15 days
        days_ago = random.randint(0, 15)
        timestamp = datetime.now() - timedelta(days=days_ago,
                                                hours=random.randint(8, 18))
        
        issue = random.choice(fountain_issues)
        resolved = random.choice([True, False])
        
        fountain_record = FountainMaintenance(
            villa_id=villa.id,
            timestamp=timestamp,
            fountain_name=f"Series{villa.villa_number[0]}-MainFountain",
            issue_description=issue,
            status="Resolved" if resolved else "Pending",
            resolved=resolved
        )
        
        db.session.add(fountain_record)
    
    db.session.commit()
    print(f"✅ Created {FountainMaintenance.query.count()} fountain maintenance records")

def update_villa_statuses():
    """Update villa statuses randomly"""
    print("Updating villa statuses...")
    
    villas = Villa.query.all()
    statuses = ['VD', 'VC', 'OCC']
    
    for villa in villas:
        # Update status based on recent maintenance
        recent_record = MaintenanceRecord.query.filter_by(villa_id=villa.id).order_by(MaintenanceRecord.timestamp.desc()).first()
        
        if recent_record:
            villa.status = recent_record.status
        else:
            villa.status = random.choice(statuses)
    
    db.session.commit()
    print("✅ Updated villa statuses")

def create_ph_alerts():
    """Create some records with low pH for alert demonstration"""
    print("Creating pH alert records...")
    
    villas = Villa.query.limit(5).all()
    
    for villa in villas:
        # Create record with low pH (< 7.2)
        low_ph = round(random.uniform(6.5, 7.1), 1)
        
        record = MaintenanceRecord(
            villa_id=villa.id,
            timestamp=datetime.now() - timedelta(hours=random.randint(1, 12)),
            chlorine_level=round(random.uniform(0.8, 1.5), 1),
            ph_level=low_ph,
            temperature=round(random.uniform(26, 30), 1),
            status='VD',
            notes=f"⚠️ LOW pH ALERT: Villa {villa.villa_number} - pH {low_ph}",
            staff_name="Alert System",
            time_in=datetime.now()
        )
        
        db.session.add(record)
    
    db.session.commit()
    print("✅ Created pH alert records")

def main():
    """Main function to seed the database"""
    print("🌱 Starting database seeding...")
    
    with app.app_context():
        # Clear existing data (optional)
        choice = input("Clear existing maintenance data? (y/N): ").lower()
        if choice == 'y':
            MaintenanceRecord.query.delete()
            FountainMaintenance.query.delete()
            db.session.commit()
            print("🧹 Cleared existing maintenance data")
        
        # Create sample data
        create_sample_maintenance_records()
        create_sample_fountain_issues()
        update_villa_statuses()
        create_ph_alerts()
        
        print("\n🎉 Database seeding complete!")
        print(f"📊 Statistics:")
        print(f"   - Total Villas: {Villa.query.count()}")
        print(f"   - Maintenance Records: {MaintenanceRecord.query.count()}")
        print(f"   - Fountain Issues: {FountainMaintenance.query.count()}")
        print(f"   - pH Alerts: {MaintenanceRecord.query.filter(MaintenanceRecord.ph_level < 7.2).count()}")
        print(f"   - Unresolved Fountain Issues: {FountainMaintenance.query.filter_by(resolved=False).count()}")

if __name__ == "__main__":
    main()