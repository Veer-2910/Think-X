"""
Dropout Prediction Model Training Script
Uses Logistic Regression to predict student dropout risk
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

def train_model():
    """Train and save the dropout prediction model"""
    
    # Load training data
    print("Loading training data...")
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'training_data.csv')
    df = pd.read_csv(data_path)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Dropout distribution:\n{df['dropout'].value_counts()}")
    
    # Prepare features and target
    X = df[['attendancePercent', 'currentCGPA', 'failedAssessments', 'disciplinaryIssues']]
    y = df['dropout']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    
    # Train Logistic Regression model
    print("\nTraining Logistic Regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n{'='*50}")
    print(f"Model Accuracy: {accuracy:.2%}")
    print(f"{'='*50}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Not at Risk', 'At Risk']))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance (coefficients)
    print("\nFeature Importance (Coefficients):")
    feature_names = X.columns
    coefficients = model.coef_[0]
    for name, coef in zip(feature_names, coefficients):
        print(f"  {name}: {coef:.4f}")
    
    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'dropout_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved to: {model_path}")
    
    return model, accuracy

if __name__ == "__main__":
    print("="*50)
    print("Student Dropout Prediction - Model Training")
    print("="*50)
    train_model()
