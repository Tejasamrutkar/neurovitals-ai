from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime, timedelta
import os

from models import (
    VitalReading, PatientBaseline, AnalysisResult, PatientSummary,
    ZScores, TrendAnalysis, RiskPrediction, ExplainableAlert
)
from validation import validate_reading
from baseline_engine import calculate_patient_baseline, calculate_z_scores
from trend_analyzer import analyze_trends
from ml_risk_model import risk_model_instance
from explainer import generate_explainable_alert
from demo_dataset import generate_initial_patient_history

app = FastAPI(
    title="NeuroVitals AI API",
    description="Intelligent ICU Monitoring & Personalized Early Warning System",
    version="1.0.0"
)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Patient state in memory for demo session
class PatientState:
    def __init__(self):
        self.patient_id = "P001"
        self.patient_name = "Eleanor Vance (Simulated)"
        self.age = 64
        self.gender = "Female"
        self.bed_id = "ICU-Bed-04"
        self.admission_time = "2026-09-11 08:00:00"
        self.reset()

    def reset(self):
        self.history: List[VitalReading] = generate_initial_patient_history(self.patient_id)
        self.baseline: PatientBaseline = calculate_patient_baseline(self.history, self.patient_id)
        latest = self.history[-1]
        z_scores = calculate_z_scores(latest, self.baseline)
        trends = analyze_trends(self.history)
        risk = risk_model_instance.predict(latest, self.baseline, z_scores, trends)
        alert = generate_explainable_alert(latest, self.baseline, z_scores, trends, risk)
        
        self.latest_analysis = AnalysisResult(
            patient_id=self.patient_id,
            timestamp=latest.timestamp,
            current_reading=latest,
            baseline=self.baseline,
            z_scores=z_scores,
            trends=trends,
            risk_prediction=risk,
            explainable_alert=alert
        )
        self.alert_log: List[AnalysisResult] = [self.latest_analysis]

patient_state = PatientState()

class SimulateRequest(BaseModel):
    heart_rate: float
    spo2: float
    temperature: float
    motion: Literal["Normal", "Restless", "Fall Detected"] = "Normal"
    timestamp: Optional[str] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NeuroVitals AI Backend",
        "version": "1.0.0",
        "patient_loaded": patient_state.patient_id
    }

@app.get("/api/patient", response_model=PatientSummary)
def get_patient():
    return PatientSummary(
        patient_id=patient_state.patient_id,
        patient_name=patient_state.patient_name,
        age=patient_state.age,
        gender=patient_state.gender,
        bed_id=patient_state.bed_id,
        admission_time=patient_state.admission_time,
        baseline=patient_state.baseline,
        latest_reading=patient_state.history[-1],
        latest_analysis=patient_state.latest_analysis,
        data_source_badge="DEMO / SIMULATED ICU DATA (MIMIC-IV Schema Compatible)"
    )

@app.get("/api/history", response_model=List[VitalReading])
def get_history():
    return patient_state.history

@app.get("/api/alerts", response_model=List[AnalysisResult])
def get_alerts():
    return patient_state.alert_log[-15:]

@app.post("/api/analyze", response_model=AnalysisResult)
def analyze_reading(reading: VitalReading):
    is_valid, notes = validate_reading(reading)
    reading.is_valid = is_valid
    reading.validation_notes = notes

    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail=f"Data validation failed: {'; '.join(notes)}"
        )

    z_scores = calculate_z_scores(reading, patient_state.baseline)
    temp_hist = patient_state.history + [reading]
    trends = analyze_trends(temp_hist)
    risk = risk_model_instance.predict(reading, patient_state.baseline, z_scores, trends)
    alert = generate_explainable_alert(reading, patient_state.baseline, z_scores, trends, risk)

    return AnalysisResult(
        patient_id=patient_state.patient_id,
        timestamp=reading.timestamp,
        current_reading=reading,
        baseline=patient_state.baseline,
        z_scores=z_scores,
        trends=trends,
        risk_prediction=risk,
        explainable_alert=alert
    )

@app.post("/api/simulate", response_model=AnalysisResult)
def simulate_new_reading(req: SimulateRequest):
    if req.timestamp:
        ts = req.timestamp
    else:
        last_ts = patient_state.history[-1].timestamp
        try:
            dt = datetime.strptime(last_ts, "%H:%M:%S") + timedelta(minutes=5)
            ts = dt.strftime("%H:%M:%S")
        except Exception:
            ts = datetime.now().strftime("%H:%M:%S")

    reading = VitalReading(
        timestamp=ts,
        heart_rate=req.heart_rate,
        spo2=req.spo2,
        temperature=req.temperature,
        motion=req.motion,
        is_valid=True,
        validation_notes=[]
    )

    is_valid, notes = validate_reading(reading)
    reading.is_valid = is_valid
    reading.validation_notes = notes

    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail=f"Data validation failed: {'; '.join(notes)}"
        )

    patient_state.history.append(reading)
    if len(patient_state.history) > 60:
        patient_state.history.pop(0)

    z_scores = calculate_z_scores(reading, patient_state.baseline)
    trends = analyze_trends(patient_state.history)
    risk = risk_model_instance.predict(reading, patient_state.baseline, z_scores, trends)
    alert = generate_explainable_alert(reading, patient_state.baseline, z_scores, trends, risk)

    analysis = AnalysisResult(
        patient_id=patient_state.patient_id,
        timestamp=ts,
        current_reading=reading,
        baseline=patient_state.baseline,
        z_scores=z_scores,
        trends=trends,
        risk_prediction=risk,
        explainable_alert=alert
    )

    patient_state.latest_analysis = analysis
    if risk.risk_status in ["WARNING", "CRITICAL"] or len(patient_state.alert_log) < 3:
        patient_state.alert_log.append(analysis)

    return analysis

@app.post("/api/reset")
def reset_patient_data():
    patient_state.reset()
    return {"status": "success", "message": "Patient P001 reset to baseline state."}

# Serve compiled Frontend static assets
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        index_file = os.path.join(frontend_dist, "index.html")
        return FileResponse(index_file)