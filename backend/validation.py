from typing import Tuple, List
from models import VitalReading

# Physiological plausible limits for ICU telemetry
HR_MIN, HR_MAX = 30.0, 220.0
SPO2_MIN, SPO2_MAX = 50.0, 100.0
TEMP_MIN, TEMP_MAX = 32.0, 43.0
VALID_MOTIONS = {"Normal", "Restless", "Fall Detected"}

def validate_reading(reading: VitalReading) -> Tuple[bool, List[str]]:
    """
    Validates incoming physiological telemetry readings.
    Checks for sensor disconnection, out-of-range artifacts, or invalid values.
    Returns (is_valid, validation_notes).
    """
    notes = []
    
    # Heart Rate check
    if reading.heart_rate is None or reading.heart_rate < HR_MIN or reading.heart_rate > HR_MAX:
        notes.append(f"Heart Rate ({reading.heart_rate} bpm) outside physiological bounds [{HR_MIN}-{HR_MAX}] - Possible artifact/lead disconnect")

    # SpO2 check
    if reading.spo2 is None or reading.spo2 < SPO2_MIN or reading.spo2 > SPO2_MAX:
        notes.append(f"SpO2 ({reading.spo2}%) outside physiological bounds [{SPO2_MIN}-{SPO2_MAX}] - Possible sensor displacement")

    # Temperature check
    if reading.temperature is None or reading.temperature < TEMP_MIN or reading.temperature > TEMP_MAX:
        notes.append(f"Temperature ({reading.temperature}°C) outside physiological bounds [{TEMP_MIN}-{TEMP_MAX}]")

    # Motion check
    if reading.motion not in VALID_MOTIONS:
        notes.append(f"Unknown motion state: {reading.motion}")

    is_valid = len(notes) == 0
    return is_valid, notes
