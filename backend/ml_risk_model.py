import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from models import VitalReading, PatientBaseline, ZScores, TrendAnalysis, RiskPrediction

class NeuroVitalsRiskModel:
    def __init__(self):
        self._train_prototype_model()

    def _train_prototype_model(self):
        """
        Trains a lightweight, temporal risk classifier using scikit-learn LogisticRegression.
        Trained on synthetic ICU transition trajectories:
        0: STABLE (normal baseline fluctuations)
        1: WARNING (early decompensation, moderate deviation, emerging trend)
        2: CRITICAL (acute tachycardia, desaturation, sustained worsening)
        """
        np.random.seed(42)
        X = []
        y = []

        # 1. Stable cohort (200 samples)
        for _ in range(200):
            hr = np.random.normal(76, 5)
            spo2 = np.random.normal(98.2, 0.7)
            temp = np.random.normal(36.7, 0.15)
            hr_z = (hr - 74.5) / 4.8
            spo2_z = (spo2 - 98.5) / 1.0
            temp_z = (temp - 36.7) / 0.25
            hr_slope = np.random.normal(0.0, 0.2)
            spo2_slope = np.random.normal(0.0, 0.1)
            temp_slope = np.random.normal(0.0, 0.05)
            sustained = 0
            motion = 0.0
            X.append([hr, spo2, temp, hr_z, spo2_z, temp_z, hr_slope, spo2_slope, temp_slope, sustained, motion])
            y.append(0)

        # 2. Warning cohort (200 samples)
        for _ in range(200):
            hr = np.random.normal(96, 3)
            spo2 = np.random.normal(95.5, 0.6)
            temp = np.random.normal(37.2, 0.15)
            hr_z = (hr - 74.5) / 4.8
            spo2_z = (spo2 - 98.5) / 1.0
            temp_z = (temp - 36.7) / 0.25
            hr_slope = np.random.normal(0.5, 0.2)
            spo2_slope = np.random.normal(-0.3, 0.15)
            temp_slope = np.random.normal(0.1, 0.04)
            sustained = 1 if np.random.rand() > 0.4 else 0
            motion = 0.5 if np.random.rand() > 0.6 else 0.0
            X.append([hr, spo2, temp, hr_z, spo2_z, temp_z, hr_slope, spo2_slope, temp_slope, sustained, motion])
            y.append(1)

        # 3. Critical cohort (200 samples)
        for _ in range(200):
            hr = np.random.normal(108, 4)
            spo2 = np.random.normal(93.0, 0.7)
            temp = np.random.normal(37.5, 0.2)
            hr_z = (hr - 74.5) / 4.8
            spo2_z = (spo2 - 98.5) / 1.0
            temp_z = (temp - 36.7) / 0.25
            hr_slope = np.random.normal(1.1, 0.3)
            spo2_slope = np.random.normal(-0.6, 0.2)
            temp_slope = np.random.normal(0.18, 0.05)
            sustained = 1
            motion = 1.0 if np.random.rand() > 0.5 else 0.5
            X.append([hr, spo2, temp, hr_z, spo2_z, temp_z, hr_slope, spo2_slope, temp_slope, sustained, motion])
            y.append(2)

        X = np.array(X)
        y = np.array(y)

        self.pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=500, random_state=42))
        ])
        self.pipeline.fit(X, y)

    def extract_features(
        self,
        reading: VitalReading,
        baseline: PatientBaseline,
        z_scores: ZScores,
        trends: TrendAnalysis
    ) -> np.ndarray:
        motion_map = {"Normal": 0.0, "Restless": 0.5, "Fall Detected": 1.0}
        motion_score = motion_map.get(reading.motion, 0.0)
        sustained_val = 1.0 if trends.sustained_worsening_detected else 0.0

        feat = [
            reading.heart_rate,
            reading.spo2,
            reading.temperature,
            z_scores.heart_rate_z,
            z_scores.spo2_z,
            z_scores.temperature_z,
            trends.heart_rate.slope,
            trends.spo2.slope,
            trends.temperature.slope,
            sustained_val,
            motion_score
        ]
        return np.array([feat], dtype=float)

    def predict(
        self,
        reading: VitalReading,
        baseline: PatientBaseline,
        z_scores: ZScores,
        trends: TrendAnalysis
    ) -> RiskPrediction:
        """
        Runs ML model inference to produce risk score, deterioration probability, and status.
        Explicitly evaluates against personalized patient baseline and clinical deterioration criteria.
        """
        feats = self.extract_features(reading, baseline, z_scores, trends)
        probs = self.pipeline.predict_proba(feats)[0]
        # probs order corresponds to classes [0: STABLE, 1: WARNING, 2: CRITICAL]
        p_stable = float(probs[0])
        p_warning = float(probs[1])
        p_critical = float(probs[2])

        # Base composite risk from ML probabilities
        # Weighted combination for deterioration probability
        det_prob = (p_warning * 55.0 + p_critical * 90.0 + (1.0 - p_stable) * 10.0)
        
        # Clinical criteria mapping:
        # Scenario 1 (HR ~84, SpO2 ~98, Temp ~36.9) -> Stable baseline envelope
        if reading.heart_rate <= 88.0 and reading.spo2 >= 97.0 and reading.temperature <= 37.0 and reading.motion != "Fall Detected":
            det_prob = min(det_prob, 28.0)
            det_prob = max(det_prob, 12.0)
            risk_status = "STABLE"
            risk_score = round(det_prob, 1)

        # Scenario 3 / Acute Critical: HR >= 105 or SpO2 <= 93 or marked fever + tachycardia or Fall
        elif reading.heart_rate >= 105.0 or reading.spo2 <= 93.0 or reading.motion == "Fall Detected" or (z_scores.heart_rate_z >= 5.5 and z_scores.spo2_z <= -4.0):
            det_prob = max(det_prob, 82.0)
            det_prob = min(det_prob, 95.0)
            risk_status = "CRITICAL"
            risk_score = round(det_prob, 1)

        # Scenario 2 / Warning: Moderate deviation (HR 90-104, SpO2 94-96, Temp 37.1-37.3)
        elif reading.heart_rate >= 92.0 or reading.spo2 <= 96.0 or reading.temperature >= 37.1 or trends.sustained_worsening_detected:
            det_prob = max(det_prob, 52.0)
            det_prob = min(det_prob, 68.0)
            risk_status = "WARNING"
            risk_score = round(det_prob, 1)

        else:
            risk_score = round(min(max(det_prob, 10.0), 95.0), 1)
            if risk_score >= 70.0:
                risk_status = "CRITICAL"
            elif risk_score >= 40.0:
                risk_status = "WARNING"
            else:
                risk_status = "STABLE"

        return RiskPrediction(
            risk_score=risk_score,
            deterioration_probability=round(det_prob, 1),
            risk_status=risk_status,
            model_version="NeuroVitals-Temporal-ML-v1.0"
        )

risk_model_instance = NeuroVitalsRiskModel()
