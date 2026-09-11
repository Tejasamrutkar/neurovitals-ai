from datetime import datetime, timedelta
from typing import List
from models import VitalReading

def generate_initial_patient_history(patient_id: str = "P001") -> List[VitalReading]:
    """
    Generates realistic, timestamped ICU observation window data for Patient P001.
    All records represent a stable initial calibration period.
    Explicitly tagged as DEMO/SIMULATED DATA.
    """
    history = []
    base_time = datetime(2026, 9, 11, 8, 0, 0)

    # 20 calibrated observations with realistic resting physiological variance
    baseline_profiles = [
        (73.0, 98.5, 36.65, "Normal"),
        (76.2, 98.4, 36.72, "Normal"),
        (72.5, 98.8, 36.63, "Normal"),
        (77.0, 98.2, 36.75, "Normal"),
        (74.5, 98.5, 36.68, "Normal"),
        (71.8, 99.0, 36.62, "Normal"),
        (75.5, 98.3, 36.71, "Normal"),
        (74.0, 98.6, 36.69, "Normal"),
        (76.5, 98.1, 36.74, "Normal"),
        (73.5, 98.7, 36.67, "Normal"),
        (74.2, 98.5, 36.70, "Normal"),
        (77.5, 98.2, 36.73, "Normal"),
        (73.8, 98.8, 36.66, "Normal"),
        (72.0, 98.6, 36.64, "Normal"),
        (75.8, 98.4, 36.71, "Normal"),
        (74.1, 98.7, 36.68, "Normal"),
        (75.0, 98.5, 36.70, "Normal"),
        (76.8, 98.3, 36.73, "Normal"),
        (73.6, 98.6, 36.67, "Normal"),
        (74.5, 98.5, 36.70, "Normal")
    ]

    for idx, (hr, spo2, temp, motion) in enumerate(baseline_profiles):
        t = base_time + timedelta(minutes=10 * idx)
        history.append(VitalReading(
            timestamp=t.strftime("%H:%M:%S"),
            heart_rate=hr,
            spo2=spo2,
            temperature=temp,
            motion=motion,
            is_valid=True,
            validation_notes=[]
        ))

    return history
