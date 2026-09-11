from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class VitalReading(BaseModel):
    timestamp: str
    heart_rate: float = Field(..., description="Heart rate in beats per minute (bpm)")
    spo2: float = Field(..., description="Blood oxygen saturation percentage (%)")
    temperature: float = Field(..., description="Core body temperature in Celsius (°C)")
    motion: Literal["Normal", "Restless", "Fall Detected"] = "Normal"
    is_valid: bool = True
    validation_notes: List[str] = []

class VitalBaseline(BaseModel):
    mean: float
    std: float
    unit: str
    sample_count: int

class PatientBaseline(BaseModel):
    patient_id: str
    window_start: str
    window_end: str
    observation_count: int
    heart_rate: VitalBaseline
    spo2: VitalBaseline
    temperature: VitalBaseline

class ZScores(BaseModel):
    heart_rate_z: float
    spo2_z: float
    temperature_z: float

class TrendMetric(BaseModel):
    direction: Literal["increasing", "decreasing", "stable"]
    slope: float
    rate_of_change_per_hour: float
    is_worsening: bool
    description: str

class TrendAnalysis(BaseModel):
    heart_rate: TrendMetric
    spo2: TrendMetric
    temperature: TrendMetric
    sustained_worsening_detected: bool
    sustained_worsening_count: int
    summary: str

class ContributingFactor(BaseModel):
    parameter: str
    impact: Literal["high", "medium", "low"]
    factor_type: Literal["deviation", "trend", "context"]
    message: str

class ExplainableAlert(BaseModel):
    headline: str
    contributing_factors: List[ContributingFactor]
    summary_text: str
    safety_disclaimer: str = "Academic Prototype — Not for Clinical Diagnosis. Do not use for clinical interventions or diagnosis."

class RiskPrediction(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Deterioration risk score from 0 to 100")
    deterioration_probability: float = Field(..., ge=0.0, le=100.0, description="Probability of clinical deterioration (%)")
    risk_status: Literal["STABLE", "WARNING", "CRITICAL"]
    model_version: str = "NeuroVitals-Temporal-ML-v1.0"

class AnalysisResult(BaseModel):
    patient_id: str
    timestamp: str
    current_reading: VitalReading
    baseline: PatientBaseline
    z_scores: ZScores
    trends: TrendAnalysis
    risk_prediction: RiskPrediction
    explainable_alert: ExplainableAlert

class PatientSummary(BaseModel):
    patient_id: str
    patient_name: str
    age: int
    gender: str
    bed_id: str
    admission_time: str
    baseline: PatientBaseline
    latest_reading: VitalReading
    latest_analysis: AnalysisResult
    data_source_badge: str = "DEMO / SIMULATED ICU DATA (MIMIC-IV Schema)"
