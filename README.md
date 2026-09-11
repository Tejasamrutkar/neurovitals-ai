# NeuroVitals AI — Intelligent ICU Monitoring & Early Warning System
**Smart India Hackathon (SIH) 2026 Student Innovation Project | MedTech / HealthTech Track**

> **Safety Notice**: *Academic Prototype — Not for Clinical Diagnosis. Software-first demonstration system utilizing simulated ICU physiological time-series data.*

---

## 🎯 10-Second Executive Summary

> **"What is NeuroVitals AI?"**  
> *"Instead of relying on fixed generic threshold alarms that cause alarm fatigue, NeuroVitals AI learns the patient's normal physiological pattern from an initial observation window, calculates statistical Z-score deviations and directional trends, estimates deterioration risk using temporal machine learning, and clearly explains the contributing factors behind every alert."*

---

## 🏥 Core Physiological Parameters
- **Heart Rate (HR)**: Beats per minute (bpm)
- **Oxygen Saturation (SpO₂)**: Percentage (%)
- **Core Temperature**: Celsius (°C)
- **Motion & Fall State**: Contextual information (Normal, Restless, Fall Detected)

---

## 🔬 Core Workflow & Algorithmic Pipeline

```
Physiological Telemetry
       ↓
Data Validation Engine (Plausibility & Lead Disconnect Checks)
       ↓
Personalized Patient Baseline (Learned Mean μ and Std Dev σ from Observation Window)
       ↓
Deviation / Z-Score Analysis [ Z = (Current - μ) / σ ]
       ↓
Sequential Trend Analysis (Slopes, Rate of Change / Hour, Sustained Worsening)
       ↓
Temporal ML Risk Model (scikit-learn Classifier & Deterioration Probability)
       ↓
Risk Classification (STABLE < 40 | WARNING 40–70 | CRITICAL > 70)
       ↓
Explainable AI Insights (Clear Clinical Contributing Factor Attribution)
       ↓
Interactive Clinical Dashboard (React, Recharts, Live Telemetry Simulator)
```

---

## ⚡ 2-Minute Live Demonstration Guide for Judges

The dashboard provides 1-click preset buttons designed specifically for hackathon evaluation:

1. **Scenario 1: STABLE**
   - **Values**: HR 84 bpm, SpO₂ 98%, Temp 36.9°C
   - **Z-Scores**: HR $Z \approx +1.96\text{ SD}$, SpO₂ $Z \approx -0.5\text{ SD}$
   - **Status**: `STABLE` (Risk: 28 / 100, Deterioration Prob: 28%)
   - **Clinical Story**: Within patient's normal physiological variation window.

2. **Scenario 2: WARNING**
   - **Values**: HR 98 bpm, SpO₂ 95%, Temp 37.2°C
   - **Z-Scores**: HR $Z \approx +4.88\text{ SD}$, SpO₂ $Z \approx -3.50\text{ SD}$
   - **Status**: `WARNING` (Risk: 68 / 100, Deterioration Prob: 68%)
   - **Contributing Factors**:
     - HR increased significantly from personal baseline (+4.9 SD)
     - SpO₂ decreased from personal baseline (-3.5 SD)
     - Sustained worsening physiological trend detected across sequential readings

3. **Scenario 3: CRITICAL**
   - **Values**: HR 108 bpm, SpO₂ 93%, Temp 37.4°C, Restless
   - **Z-Scores**: HR $Z \approx +6.96\text{ SD}$, SpO₂ $Z \approx -5.50\text{ SD}$
   - **Status**: `CRITICAL` (Risk: 95 / 100, Deterioration Prob: 95%)
   - **Contributing Factors**:
     - Severe tachycardia deviating +7.0 SD above baseline
     - Acute desaturation (-5.5 SD below personal baseline)
     - Sustained worsening trajectory
     - Agitation / restlessness context

4. **Live Auto-Stream Mode**:
   - Toggle **"Auto Stream Telemetry"** to observe continuous real-time ICU telemetry updating every 2.5 seconds.
5. **Interactive Sliders**:
   - Manually adjust HR, SpO₂, Temperature, and Motion to test edge cases.
6. **Reset Patient P001**:
   - Restores Patient P001 to the pristine 20-reading calibrated baseline window.

---

## 🚀 Running the System Locally

### Backend (FastAPI + scikit-learn)
```bash
cd backend
python -u run_server.py
```
- Server URL: `http://127.0.0.1:8000`
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

### Frontend (React + TypeScript + Vite)
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📡 REST API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and active patient verification |
| `GET` | `/api/patient` | Demographics, calibrated baseline, latest analysis |
| `GET` | `/api/history` | Historical ICU time-series telemetry |
| `GET` | `/api/alerts` | Log of past warning and critical alerts |
| `POST` | `/api/simulate` | Ingests new reading, calculates Z-scores, trend, ML risk, and returns explainable alert |
| `POST` | `/api/reset` | Resets telemetry state to initial calibrated baseline |

---

## 🏛️ Architecture & Future MIMIC-IV / PhysioNet Compatibility
The data models in `models.py` use structured schemas matching standard PhysioNet / MIMIC-IV ICU concepts (`subject_id`, `charttime`, `valuenum`, `itemid`). This allows plugging in real clinical de-identified databases with an adapter module in Phase 2.
