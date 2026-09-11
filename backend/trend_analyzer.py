import numpy as np
from typing import List
from models import VitalReading, TrendMetric, TrendAnalysis

def analyze_single_metric_trend(values: List[float], param_name: str) -> TrendMetric:
    """
    Computes slope and direction over recent sequential readings.
    """
    n = len(values)
    if n < 2:
        return TrendMetric(
            direction="stable",
            slope=0.0,
            rate_of_change_per_hour=0.0,
            is_worsening=False,
            description="Insufficient history for trend"
        )

    # Time steps (e.g. 5 minutes apart in ICU telemetry)
    x = np.arange(n)
    y = np.array(values, dtype=float)
    
    # Linear slope
    slope, _ = np.polyfit(x, y, 1)
    # Scale slope to rate per hour (assuming 5-min intervals, so 12 steps/hour)
    rate_per_hour = slope * 12.0

    # Determine thresholds for significance
    thresholds = {
        "heart_rate": 0.4,
        "spo2": 0.2,
        "temperature": 0.05
    }
    thresh = thresholds.get(param_name, 0.3)

    if slope > thresh:
        direction = "increasing"
    elif slope < -thresh:
        direction = "decreasing"
    else:
        direction = "stable"

    # Worsening logic in acute ICU context:
    # HR increasing -> tachycardia / worsening
    # SpO2 decreasing -> desaturation / worsening
    # Temperature increasing -> fever / hyperthermia / sepsis flag
    is_worsening = False
    desc = f"{param_name.replace('_', ' ').title()} is {direction}"
    
    if param_name == "heart_rate":
        if direction == "increasing":
            is_worsening = True
            desc = f"HR increasing rapidly (+{rate_per_hour:.1f} bpm/hr)"
        elif direction == "decreasing" and y[-1] < 50:
            is_worsening = True
            desc = f"HR dropping into bradycardia ({rate_per_hour:.1f} bpm/hr)"
        else:
            desc = f"HR {direction} ({rate_per_hour:+.1f} bpm/hr)"
            
    elif param_name == "spo2":
        if direction == "decreasing":
            is_worsening = True
            desc = f"SpO2 decreasing steadily ({rate_per_hour:.1f}%/hr)"
        else:
            desc = f"SpO2 {direction} ({rate_per_hour:+.1f}%/hr)"
            
    elif param_name == "temperature":
        if direction == "increasing":
            is_worsening = True
            desc = f"Temp rising (+{rate_per_hour:.2f}°C/hr)"
        else:
            desc = f"Temp {direction} ({rate_per_hour:+.2f}°C/hr)"

    return TrendMetric(
        direction=direction,
        slope=round(float(slope), 3),
        rate_of_change_per_hour=round(float(rate_per_hour), 2),
        is_worsening=is_worsening,
        description=desc
    )

def analyze_trends(history_readings: List[VitalReading], window_size: int = 5) -> TrendAnalysis:
    """
    Analyzes recent sequential readings to detect sustained physiological trends.
    Avoids false alarms from a single noisy reading by evaluating trajectory.
    """
    valid_readings = [r for r in history_readings if r.is_valid]
    recent = valid_readings[-window_size:] if len(valid_readings) >= window_size else valid_readings

    hr_vals = [r.heart_rate for r in recent]
    spo2_vals = [r.spo2 for r in recent]
    temp_vals = [r.temperature for r in recent]

    hr_trend = analyze_single_metric_trend(hr_vals, "heart_rate")
    spo2_trend = analyze_single_metric_trend(spo2_vals, "spo2")
    temp_trend = analyze_single_metric_trend(temp_vals, "temperature")

    # Sustained worsening criteria:
    # At least two vitals worsening OR one vital worsening continuously over multiple readings
    worsening_count = sum([1 for t in [hr_trend, spo2_trend, temp_trend] if t.is_worsening])
    
    # Check if last 3 readings are monotonically worsening in HR or SpO2
    monotonic_hr_rise = len(hr_vals) >= 3 and all(hr_vals[i] <= hr_vals[i+1] for i in range(len(hr_vals)-1)) and (hr_vals[-1] - hr_vals[0] >= 6)
    monotonic_spo2_drop = len(spo2_vals) >= 3 and all(spo2_vals[i] >= spo2_vals[i+1] for i in range(len(spo2_vals)-1)) and (spo2_vals[0] - spo2_vals[-1] >= 2)

    sustained = worsening_count >= 2 or monotonic_hr_rise or monotonic_spo2_drop

    summaries = []
    if sustained:
        summaries.append("Sustained worsening trajectory detected across sequential readings.")
    elif worsening_count == 1:
        summaries.append("Isolated metric deviation; monitoring for trend persistence.")
    else:
        summaries.append("Physiological trajectory is stable within normal personal variation.")

    return TrendAnalysis(
        heart_rate=hr_trend,
        spo2=spo2_trend,
        temperature=temp_trend,
        sustained_worsening_detected=sustained,
        sustained_worsening_count=worsening_count,
        summary=" ".join(summaries)
    )
