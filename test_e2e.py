import urllib.request
import json
import sys

base = 'http://127.0.0.1:8000/api'

def post_json(endpoint, data):
    req = urllib.request.Request(
        f'{base}{endpoint}',
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))

def get_json(endpoint):
    with urllib.request.urlopen(f'{base}{endpoint}') as response:
        return json.loads(response.read().decode('utf-8'))

print('=== E2E SYSTEM INTEGRATION TEST ===')

# 1. Reset
post_json('/reset', {})
patient = get_json('/patient')
p_id = patient['patient_id']
p_name = patient['patient_name']
b_hr = patient['baseline']['heart_rate']['mean']
b_spo2 = patient['baseline']['spo2']['mean']
b_temp = patient['baseline']['temperature']['mean']
print(f'[PASS] Patient loaded: {p_id} ({p_name})')
print(f'       Baseline HR: {b_hr} bpm | SpO2: {b_spo2}% | Temp: {b_temp} C')

# 2. Test Scenario 1: Stable
s1 = post_json('/simulate', {'heart_rate': 84.0, 'spo2': 98.0, 'temperature': 36.9, 'motion': 'Normal'})
st1 = s1['risk_prediction']['risk_status']
sc1 = s1['risk_prediction']['risk_score']
pb1 = s1['risk_prediction']['deterioration_probability']
z_hr1 = s1['z_scores']['heart_rate_z']
z_sp1 = s1['z_scores']['spo2_z']
print(f'\n[PASS] Scenario 1 Simulated:')
print(f'       Status: {st1} | Risk: {sc1} | Prob: {pb1}% | HR Z: {z_hr1} | SpO2 Z: {z_sp1}')
assert st1 == 'STABLE', f'Expected STABLE, got {st1}'

# 3. Test Scenario 2: Warning
s2 = post_json('/simulate', {'heart_rate': 98.0, 'spo2': 95.0, 'temperature': 37.2, 'motion': 'Normal'})
st2 = s2['risk_prediction']['risk_status']
sc2 = s2['risk_prediction']['risk_score']
pb2 = s2['risk_prediction']['deterioration_probability']
z_hr2 = s2['z_scores']['heart_rate_z']
z_sp2 = s2['z_scores']['spo2_z']
print(f'\n[PASS] Scenario 2 Simulated:')
print(f'       Status: {st2} | Risk: {sc2} | Prob: {pb2}% | HR Z: {z_hr2} | SpO2 Z: {z_sp2}')
for f in s2['explainable_alert']['contributing_factors']:
    print(f'         * [{f["impact"].upper()}] {f["message"]}')
assert st2 == 'WARNING', f'Expected WARNING, got {st2}'

# 4. Test Scenario 3: Critical
s3 = post_json('/simulate', {'heart_rate': 108.0, 'spo2': 93.0, 'temperature': 37.4, 'motion': 'Restless'})
st3 = s3['risk_prediction']['risk_status']
sc3 = s3['risk_prediction']['risk_score']
pb3 = s3['risk_prediction']['deterioration_probability']
z_hr3 = s3['z_scores']['heart_rate_z']
z_sp3 = s3['z_scores']['spo2_z']
print(f'\n[PASS] Scenario 3 Simulated:')
print(f'       Status: {st3} | Risk: {sc3} | Prob: {pb3}% | HR Z: {z_hr3} | SpO2 Z: {z_sp3}')
for f in s3['explainable_alert']['contributing_factors']:
    print(f'         * [{f["impact"].upper()}] {f["message"]}')
assert st3 == 'CRITICAL', f'Expected CRITICAL, got {st3}'

# 5. Check History updated
history = get_json('/history')
print(f'\n[PASS] Continuous history count: {len(history)} readings')
assert len(history) >= 23, 'Expected at least 23 readings in history'

print('\n>>> ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! <<<')
