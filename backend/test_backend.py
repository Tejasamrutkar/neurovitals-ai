from main import app, patient_state, SimulateRequest, simulate_new_reading
from validation import validate_reading
from models import VitalReading

print("--- TESTING BACKEND ENGINE ---")
patient_state.reset()
b = patient_state.baseline
print(f"Patient Baseline Calibrated: HR Mean={b.heart_rate.mean} Std={b.heart_rate.std}, SpO2 Mean={b.spo2.mean} Std={b.spo2.std}, Temp Mean={b.temperature.mean} Std={b.temperature.std}")

# Test Scenario 1: HR 84, SpO2 98, Temp 36.9 -> STABLE
res1 = simulate_new_reading(SimulateRequest(heart_rate=84.0, spo2=98.0, temperature=36.9, motion="Normal"))
print(f"\nScenario 1 -> Status: {res1.risk_prediction.risk_status}, Risk Score: {res1.risk_prediction.risk_score}, Prob: {res1.risk_prediction.deterioration_probability}%")
print(f"Z-scores: HR Z={res1.z_scores.heart_rate_z}, SpO2 Z={res1.z_scores.spo2_z}, Temp Z={res1.z_scores.temperature_z}")
print(f"Explainable alert headline: {res1.explainable_alert.headline}")
assert res1.risk_prediction.risk_status == "STABLE", f"Expected STABLE, got {res1.risk_prediction.risk_status}"

# Test Scenario 2: HR 98, SpO2 95, Temp 37.2 -> WARNING
res2 = simulate_new_reading(SimulateRequest(heart_rate=98.0, spo2=95.0, temperature=37.2, motion="Normal"))
print(f"\nScenario 2 -> Status: {res2.risk_prediction.risk_status}, Risk Score: {res2.risk_prediction.risk_score}, Prob: {res2.risk_prediction.deterioration_probability}%")
print(f"Z-scores: HR Z={res2.z_scores.heart_rate_z}, SpO2 Z={res2.z_scores.spo2_z}, Temp Z={res2.z_scores.temperature_z}")
print(f"Explainable factors count: {len(res2.explainable_alert.contributing_factors)}")
for f in res2.explainable_alert.contributing_factors:
    print(f"  - [{f.impact.upper()}] {f.message}")
assert res2.risk_prediction.risk_status == "WARNING", f"Expected WARNING, got {res2.risk_prediction.risk_status}"

# Test Scenario 3: HR 108, SpO2 93, Temp 37.4 -> CRITICAL
res3 = simulate_new_reading(SimulateRequest(heart_rate=108.0, spo2=93.0, temperature=37.4, motion="Restless"))
print(f"\nScenario 3 -> Status: {res3.risk_prediction.risk_status}, Risk Score: {res3.risk_prediction.risk_score}, Prob: {res3.risk_prediction.deterioration_probability}%")
print(f"Z-scores: HR Z={res3.z_scores.heart_rate_z}, SpO2 Z={res3.z_scores.spo2_z}, Temp Z={res3.z_scores.temperature_z}")
print(f"Explainable factors count: {len(res3.explainable_alert.contributing_factors)}")
for f in res3.explainable_alert.contributing_factors:
    print(f"  - [{f.impact.upper()}] {f.message}")
assert res3.risk_prediction.risk_status == "CRITICAL", f"Expected CRITICAL, got {res3.risk_prediction.risk_status}"

# Test Invalid Data Validation
bad_reading = VitalReading(timestamp="12:00:00", heart_rate=350.0, spo2=20.0, temperature=48.0)
is_valid, notes = validate_reading(bad_reading)
print(f"\nData Validation Test on out-of-range sensor artifact: is_valid={is_valid}, notes={notes}")
assert is_valid == False, "Expected invalid reading to fail validation"

print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")
