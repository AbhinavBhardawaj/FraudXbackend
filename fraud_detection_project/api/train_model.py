import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
import joblib

# === SETUP PATHS ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(BASE_DIR, 'data', 'creditcard.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'ml_model', 'xgboost_fraud_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'ml_model', 'scaler.pkl')
PREDICTION_CSV = os.path.join(BASE_DIR, 'reports', 'fraud_predictions.csv')
TOP_FEATURES_CSV = os.path.join(BASE_DIR, 'reports', 'top_10_features.csv')

# === LOAD DATA ===
df = pd.read_csv(DATA_PATH).dropna()

# === SAMPLE DATA FOR TRAINING ===
df_sample = df.sample(n=50000, random_state=42, replace=True)
x = df_sample.drop("Class", axis=1)
y = df_sample["Class"]

# === TRAIN-TEST SPLIT BEFORE SCALING OR SMOTE ===
x_train, x_test, y_train, y_test = train_test_split(
    x, y, test_size=0.2, stratify=y, random_state=42
)

# === APPLY SMOTE ON TRAIN SET ONLY ===
smote = SMOTE(random_state=42)
x_train_resampled, y_train_resampled = smote.fit_resample(x_train, y_train)

# === SCALE AFTER RESAMPLING ===
scaler = StandardScaler()
x_train_scaled = scaler.fit_transform(x_train_resampled)
x_test_scaled = scaler.transform(x_test)

# Save the scaler
os.makedirs(os.path.dirname(SCALER_PATH), exist_ok=True)
joblib.dump(scaler, SCALER_PATH)
print(f"Scaler saved at: {SCALER_PATH}")

# === XGBOOST HYPERPARAMETER TUNING ===
param_dist = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1, 0.3],
    'subsample': [0.7, 1.0],
    'colsample_bytree': [0.7, 1.0],
    'gamma': [0, 1],
    'scale_pos_weight': [50, 70, 99]
}

xgb = XGBClassifier(eval_metric='logloss', use_label_encoder=False, random_state=42)

random_search = RandomizedSearchCV(
    estimator=xgb,
    param_distributions=param_dist,
    n_iter=10,
    scoring='roc_auc',
    cv=3,
    verbose=2,
    n_jobs=-1,
    random_state=42
)

# === TRAIN THE MODEL ===
random_search.fit(x_train_scaled, y_train_resampled)
best_model = random_search.best_estimator_

# Save the model
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(best_model, MODEL_PATH)
print(f"Model saved at: {MODEL_PATH}")

# === EVALUATE ON UNSEEN TEST DATA ===
y_pred = best_model.predict(x_test_scaled)
y_proba = best_model.predict_proba(x_test_scaled)[:, 1]

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print(f"AUC Score: {roc_auc_score(y_test, y_proba):.4f}")

# === SAVE PREDICTIONS FOR ANALYSIS ===
results = pd.DataFrame(x_test, columns=x.columns)
results['Actual'] = y_test.values
results['Predicted'] = y_pred
results['Probability'] = y_proba

os.makedirs(os.path.dirname(PREDICTION_CSV), exist_ok=True)
results.to_csv(PREDICTION_CSV, index=False)
print(f"Predictions saved at: {PREDICTION_CSV}")

# === SAVE TOP 10 FEATURE IMPORTANCES ===
xgb_importance = best_model.feature_importances_
importance_df = pd.DataFrame({
    'Feature': x.columns,
    'Importance': xgb_importance
}).sort_values(by="Importance", ascending=False)

os.makedirs(os.path.dirname(TOP_FEATURES_CSV), exist_ok=True)
importance_df.head(10).to_csv(TOP_FEATURES_CSV, index=False)
print(f"Top 10 features saved at: {TOP_FEATURES_CSV}")
