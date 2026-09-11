import numpy as np
from typing import List
from models import VitalReading, PatientBaseline, VitalBaseline, ZScores

def calculate_patient_baseline(readings: List[VitalReading], patient_id: str = "P001") -> PatientBaseline:
    """
    Automatically calculates the patient's personalized baseline from an initial
    stable observation window. Computes mean and standard deviation for HR, SpO2, and Temp.
    Staff/clinicians do NOT manually enter these baselines.
    """
    valid_readings = [r for r in readings if r.is_valid]
    if not valid_readings:
        raise ValueError("Cannot calculate baseline: No valid readings available in observation window.")

    hr_values = [r.heart_rate for r in valid_readings]
    spo2_values = [r.spo2 for r in valid_readings]
    temp_values = [r.temperature for r in valid_readings]

    hr_mean = float(np.mean(hr_values))
    # Physiological variance floor matching clinical ICU baseline dynamics
    hr_std = max(float(np.std(hr_values, ddof=1) if len(hr_values) > 1 else 5.0), 4.8)

    spo2_mean = float(np.mean(spo2_values))
    spo2_std = max(float(np.std(spo2_values, ddof=1) if len(spo2_values) > 1 else 1.0), 1.0)

    temp_mean = float(np.mean(temp_values))
    temp_std = max(float(np.std(temp_values, ddof=1) if len(temp_values) > 1 else 0.25), 0.25)

    count = len(valid_readings)
    window_start = valid_readings[0].timestamp
    window_end = valid_readings[-1].timestamp

    return PatientBaseline(
        patient_id=patient_id,
        window_start=window_start,
        window_end=window_end,
        observation_count=count,
        heart_rate=VitalBaseline(mean=round(hr_mean, 1), std=round(hr_std, 2), unit="bpm", sample_count=count),
        spo2=VitalBaseline(mean=round(spo2_mean, 1), std=round(spo2_std, 2), unit="%", sample_count=count),
        temperature=VitalBaseline(mean=round(temp_mean, 2), std=round(temp_std, 2), unit="°C", sample_count=count)
    )

def calculate_z_scores(reading: VitalReading, baseline: PatientBaseline) -> ZScores:
    """
    Computes statistical deviation from the patient's own calibrated baseline:
    Z = (Current Value - Baseline Mean) / Baseline Standard Deviation
    """
    hr_z = (reading.heart_rate - baseline.heart_rate.mean) / baseline.heart_rate.std
    spo2_z = (reading.spo2 - baseline.spo2.mean) / baseline.spo2.std
    temp_z = (reading.temperature - baseline.temperature.mean) / baseline.temperature.std

    return ZScores(
        heart_rate_z=round(float(hr_z), 2),
        spo2_z=round(float(spo2_z), 2),
        temperature_z=round(float(temp_z), 2)
    )
