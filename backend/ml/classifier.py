import os
import pandas as pd
import joblib
from datetime import datetime
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sqlalchemy.orm import Session

from backend.db.models import FileDetail
from backend.db.database import get_db, SessionLocal

MODEL_PATH = os.path.join(os.getcwd(), 'backend', 'ml', 'dormancy_model.pkl')

def extract_features(file: FileDetail):
    """
    Extracts features for the ML model from a FileDetail record.
    Returns: [file_size, days_since_access, access_count, file_type_encoded]
    """
    now = datetime.utcnow()
    days_since_access = (now - file.last_access_time).days
    
    # Simple hash for file_type to numeric value for Decision Tree.
    # In a real scenario, use OneHotEncoding or LabelEncoding.
    file_type_encoded = hash(file.file_type) % 100 if file.file_type else 0
    
    return [file.file_size, days_since_access, file.access_count, file_type_encoded]

def train_model():
    """Trains the Decision Tree Classifier using accumulated database records."""
    db = SessionLocal()
    
    try:
        files = db.query(FileDetail).all()
        if not files or len(files) < 10:
            print("Not enough data to train model. Minimum 10 records required. Using simple fallback logic.")
            return False
            
        data = []
        for f in files:
            features = extract_features(f)
            # Label heuristic based on current settings or hardcoded (e.g. inactive > 30 days is dormant)
            # For bootstrap training, we'll label > 14 days inactivity OR low access count as dormant target
            target = 1 if features[1] > 14 or (f.file_size > 50 and features[1] > 7) else 0
            
            # If user explicitly archived it, it's dormant for sure
            if f.archived:
                target = 1
                
            features.append(target)
            data.append(features)
            
        df = pd.DataFrame(data, columns=['file_size', 'days_since_access', 'access_count', 'file_type', 'dormant'])
        
        X = df[['file_size', 'days_since_access', 'access_count', 'file_type']]
        y = df['dormant']
        
        # We need classes for both 0 and 1, so if not present, training isn't optimal
        if len(y.unique()) < 2:
            print("Only one class present in pseudo-labels. Skipping training.")
            return False

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = DecisionTreeClassifier()
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        print(f"Model trained successfully. Test Accuracy: {acc:.2f}")
        
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        return True
        
    finally:
        db.close()

def predict_dormancy(file: FileDetail) -> bool:
    """Predicts if a file is dormant using the trained model or a fallback rule."""
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            features = extract_features(file)
            prediction = model.predict([features])
            return bool(prediction[0] == 1)
        except Exception as e:
            print(f"Prediction failed, falling back to rules: {e}")
            
    # Fallback rules
    now = datetime.utcnow()
    days_since_access = (now - file.last_access_time).days
    return days_since_access > 30 or (file.file_size > 100 and days_since_access > 15)
