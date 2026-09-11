from typing import List
from models import VitalReading, PatientBaseline, ZScores, TrendAnalysis, RiskPrediction, ExplainableAlert, ContributingFactor

def generate_explainable_alert(
    reading: VitalReading,
    baseline: PatientBaseline,
    z_scores: ZScores,
    trends: TrendAnalysis,
    risk: RiskPrediction
) -> ExplainableAlert:
    """
    Synthesizes physiological deviations, statistical Z-scores, and temporal trends
    into clinician-interpretable contributing factors.
    Strictly avoids clinical diagnosis or treatment suggestions.
    """
    factors: List[ContributingFactor] = []

    # 1. Heart Rate Deviation & Trend
    if z_scores.heart_rate_z >= 2.0:
        impact = "high" if z_scores.heart_rate_z >= 3.0 or reading.heart_rate >= 100 else "medium"
        factors.append(ContributingFactor(
            parameter="Heart Rate",
            impact=impact,
            factor_type="deviation",
            message=f"HR increased significantly from personal baseline ({reading.heart_rate:.0f} bpm vs baseline {baseline.heart_rate.mean:.0f} bpm, Z = +{z_scores.heart_rate_z:.1f} SD)"
        ))
    elif z_scores.heart_rate_z <= -2.0:
        factors.append(ContributingFactor(
            parameter="Heart Rate",
            impact="medium",
            factor_type="deviation",
            message=f"HR dropped markedly below personal baseline ({reading.heart_rate:.0f} bpm vs baseline {baseline.heart_rate.mean:.0f} bpm, Z = {z_scores.heart_rate_z:.1f} SD)"
        ))

    # 2. SpO2 Deviation & Trend
    if z_scores.spo2_z <= -1.8 or reading.spo2 < 96.0:
        impact = "high" if reading.spo2 <= 93.0 or z_scores.spo2_z <= -3.0 else "medium"
        factors.append(ContributingFactor(
            parameter="SpO2",
            impact=impact,
            factor_type="deviation",
            message=f"SpO2 decreased from personal baseline ({reading.spo2:.0f}% vs baseline {baseline.spo2.mean:.0f}%, Z = {z_scores.spo2_z:.1f} SD)"
        ))

    # 3. Temperature Deviation
    if z_scores.temperature_z >= 2.0 or reading.temperature >= 37.2:
        impact = "high" if reading.temperature >= 38.0 or z_scores.temperature_z >= 3.0 else "medium"
        factors.append(ContributingFactor(
            parameter="Temperature",
            impact=impact,
            factor_type="deviation",
            message=f"Core temperature elevated above baseline ({reading.temperature:.1f}°C vs baseline {baseline.temperature.mean:.1f}°C, Z = +{z_scores.temperature_z:.1f} SD)"
        ))
    elif z_scores.temperature_z <= -2.0:
        factors.append(ContributingFactor(
            parameter="Temperature",
            impact="medium",
            factor_type="deviation",
            message=f"Hypothermic trend below baseline ({reading.temperature:.1f}°C vs baseline {baseline.temperature.mean:.1f}°C, Z = {z_scores.temperature_z:.1f} SD)"
        ))

    # 4. Sustained Trend Analysis Factor
    if trends.sustained_worsening_detected:
        factors.append(ContributingFactor(
            parameter="Physiological Trend",
            impact="high",
            factor_type="trend",
            message=f"Sustained worsening physiological trend detected across sequential readings ({trends.summary})"
        ))
    elif trends.heart_rate.is_worsening or trends.spo2.is_worsening:
        factors.append(ContributingFactor(
            parameter="Physiological Trend",
            impact="medium",
            factor_type="trend",
            message=f"Directional vital drift: {trends.heart_rate.description}; {trends.spo2.description}"
        ))

    # 5. Motion / Contextual Factor
    if reading.motion == "Fall Detected":
        factors.append(ContributingFactor(
            parameter="Motion Context",
            impact="high",
            factor_type="context",
            message="Sudden fall event or acute posture collapse registered by contextual sensor."
        ))
    elif reading.motion == "Restless":
        factors.append(ContributingFactor(
            parameter="Motion Context",
            impact="low",
            factor_type="context",
            message="Patient agitation/restlessness observed; may contribute to sympathetic elevation."
        ))

    # If stable and no factors triggered
    if not factors:
        factors.append(ContributingFactor(
            parameter="All Parameters",
            impact="low",
            factor_type="deviation",
            message="All vital signs remain concordant with personalized baseline boundaries."
        ))

    # Headline based on status
    if risk.risk_status == "CRITICAL":
        headline = f"CRITICAL DETERIORATION ALERT (Risk: {risk.risk_score:.0f} | Prob: {risk.deterioration_probability:.0f}%)"
    elif risk.risk_status == "WARNING":
        headline = f"PHYSIOLOGICAL WARNING: Early Deviation Detected (Risk: {risk.risk_score:.0f} | Prob: {risk.deterioration_probability:.0f}%)"
    else:
        headline = f"PHYSIOLOGICAL STATUS: STABLE (Risk: {risk.risk_score:.0f} | Prob: {risk.deterioration_probability:.0f}%)"

    bullet_summary = " • " + " • ".join([f.message for f in factors])

    return ExplainableAlert(
        headline=headline,
        contributing_factors=factors,
        summary_text=bullet_summary,
        safety_disclaimer="Academic Prototype — Not for Clinical Diagnosis. Automated mathematical interpretation."
    )
