"""
Quick Model Generator - Creates a pre-trained model without requiring training data
This allows the ML system to work immediately
"""

from sklearn.linear_model import LogisticRegression
import joblib
import os
import numpy as np

def create_pretrained_model():
    """Create a simple pre-trained model with reasonable coefficients"""
    
    print("="*50)
    print("Creating Pre-trained ML Model")
    print("="*50)
    
    # Create a Logistic Regression model
    model = LogisticRegression(random_state=42, max_iter=1000)
    
    # Generate synthetic training data
    # Features: [attendance%, CGPA, failures, issues]
    # Target: dropout (0=not at risk, 1=at risk)
    
    np.random.seed(42)
    n_samples = 1000
    
    # Generate samples
    X = np.zeros((n_samples, 4))
    y = np.zeros(n_samples)
    
    for i in range(n_samples):
        if i < 700:  # 70% not at risk
            X[i] = [
                np.random.uniform(75, 100),  # Good attendance
                np.random.uniform(6.5, 10),  # Good CGPA
                np.random.randint(0, 2),     # Few failures
                np.random.randint(0, 1)      # No issues
            ]
            y[i] = 0  # Not at risk
        else:  # 30% at risk
            X[i] = [
                np.random.uniform(40, 75),   # Poor attendance
                np.random.uniform(2, 6.5),   # Low CGPA
                np.random.randint(2, 6),     # Many failures
                np.random.randint(0, 3)      # Some issues
            ]
            y[i] = 1  # At risk
    
    # Train the model
    print("\nTraining model on synthetic data...")
    model.fit(X, y)
    
    # Display model info
    print(f"\nModel trained successfully!")
    print(f"Training samples: {n_samples}")
    print(f"\nFeature Coefficients:")
    feature_names = ['Attendance', 'CGPA', 'Failures', 'Issues']
    for name, coef in zip(feature_names, model.coef_[0]):
        print(f"  {name}: {coef:.4f}")
    
    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'dropout_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved to: {model_path}")
    print("="*50)
    
    return model

if __name__ == "__main__":
    create_pretrained_model()
    
    # Test the model
    print("\nTesting model with sample predictions...")
    from predict import predict_dropout
    
    test_cases = [
        (85, 7.5, 2, 0, "Good Student"),
        (60, 5.0, 4, 1, "Average Student"),
        (45, 3.5, 6, 2, "At-Risk Student"),
    ]
    
    for attendance, cgpa, failures, issues, label in test_cases:
        result = predict_dropout(attendance, cgpa, failures, issues)
        print(f"\n{label}:")
        print(f"  Attendance: {attendance}%, CGPA: {cgpa}")
        print(f"  Failures: {failures}, Issues: {issues}")
        print(f"  → Dropout Risk: {result['dropout_probability']:.1%}")
        print(f"  → Risk Level: {result['risk_level']}")
