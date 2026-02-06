"""
Dropout Prediction Script
Loads trained model and predicts dropout probability for a student
"""

import joblib
import numpy as np
import os
import argparse

def load_model():
    """Load the trained model"""
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'dropout_model.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found at {model_path}. "
            "Please run train_model.py first to train the model."
        )
    
    return joblib.load(model_path)

def predict_dropout(attendance_percent, cgpa, failed_assessments, disciplinary_issues):
    """
    Predict dropout probability for a student
    
    Args:
        attendance_percent (float): Attendance percentage (0-100)
        cgpa (float): Current CGPA (0-10)
        failed_assessments (int): Number of failed assessments
        disciplinary_issues (int): Number of disciplinary issues
    
    Returns:
        dict: Prediction results with probability and risk level
    """
    
    # Load model
    model = load_model()
    
    # Prepare features
    features = np.array([[attendance_percent, cgpa, failed_assessments, disciplinary_issues]])
    
    # Get prediction and probability
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0]
    
    # Probability of dropout (class 1)
    dropout_prob = probability[1]
    
    # Determine risk level based on probability
    if dropout_prob >= 0.7:
        risk_level = "HIGH"
    elif dropout_prob >= 0.4:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    return {
        "dropout_probability": float(dropout_prob),
        "risk_level": risk_level,
        "prediction": "At Risk" if prediction == 1 else "Not at Risk",
        "confidence": float(max(probability))
    }

def main():
    """Command-line interface for predictions"""
    parser = argparse.ArgumentParser(description='Predict student dropout risk')
    parser.add_argument('--attendance', type=float, required=True, 
                       help='Attendance percentage (0-100)')
    parser.add_argument('--cgpa', type=float, required=True, 
                       help='Current CGPA (0-10)')
    parser.add_argument('--failures', type=int, default=0, 
                       help='Number of failed assessments')
    parser.add_argument('--issues', type=int, default=0, 
                       help='Number of disciplinary issues')
    
    args = parser.parse_args()
    
    # Make prediction
    result = predict_dropout(
        args.attendance, 
        args.cgpa, 
        args.failures, 
        args.issues
    )
    
    # Display results
    print("\n" + "="*50)
    print("Dropout Risk Prediction")
    print("="*50)
    print(f"Attendance: {args.attendance}%")
    print(f"CGPA: {args.cgpa}")
    print(f"Failed Assessments: {args.failures}")
    print(f"Disciplinary Issues: {args.issues}")
    print("-"*50)
    print(f"Dropout Probability: {result['dropout_probability']:.2%}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print("="*50 + "\n")
    
    return result

if __name__ == "__main__":
    main()
