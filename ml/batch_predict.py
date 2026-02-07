"""
Batch Dropout Risk Prediction
Updates dropout risk for all students in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import joblib
import numpy as np
from backend.src.config.database import prisma

def load_model():
    """Load the trained model"""
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'dropout_model.pkl')
    
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print("Please run train_model.py first to train the model.")
        return None
    
    return joblib.load(model_path)

def calculate_risk_level(dropout_prob):
    """Determine risk level based on dropout probability"""
    if dropout_prob >= 0.7:
        return "HIGH"
    elif dropout_prob >= 0.4:
        return "MEDIUM"
    else:
        return "LOW"

async def update_all_students():
    """Update risk levels for all students"""
    
    print("🔄 Starting batch risk prediction...\n")
    
    # Load model
    model = load_model()
    if model is None:
        return
    
    try:
        # Connect to database
        await prisma.connect()
        
        # Get all students
        students = await prisma.student.find_many()
        
        print(f"Found {len(students)} students\n")
        
        updated_count = 0
        high_risk = 0
        medium_risk = 0
        low_risk = 0
        
        for student in students:
            # Prepare features
            attendance = student.attendancePercent or 0
            cgpa = student.currentCGPA or 0
            failed_assessments = 0  # Would need to calculate from assessments
            disciplinary = student.disciplinaryIssues or 0
            
            features = np.array([[attendance, cgpa, failed_assessments, disciplinary]])
            
            # Get prediction
            probability = model.predict_proba(features)[0]
            dropout_prob = float(probability[1])
            risk_level = calculate_risk_level(dropout_prob)
            
            # Update student
            await prisma.student.update(
                where={'id': student.id},
                data={
                    'dropoutRisk': risk_level,
                    'mlProbability': dropout_prob
                }
            )
            
            updated_count += 1
            
            if risk_level == "HIGH":
                high_risk += 1
            elif risk_level == "MEDIUM":
                medium_risk += 1
            else:
                low_risk += 1
            
            # Print progress
            if updated_count % 50 == 0:
                print(f"✅ Updated {updated_count}/{len(students)} students...")
        
        print(f"\n✅ Successfully updated {updated_count} students!")
        print(f"\n📊 Risk Distribution:")
        print(f"   🔴 HIGH Risk: {high_risk}")
        print(f"   🟡 MEDIUM Risk: {medium_risk}")
        print(f"   🟢 LOW Risk: {low_risk}")
        
    except Exception as error:
        print(f"❌ Error: {error}")
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(update_all_students())
