export type MotionState = 'Normal' | 'Restless' | 'Fall Detected';
export type RiskStatus = 'STABLE' | 'WARNING' | 'CRITICAL';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface VitalReading {
  timestamp: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  motion: MotionState;
  is_valid: boolean;
  validation_notes: string[];
}

export interface VitalBaseline {
  mean: number;
  std: number;
  unit: string;
  sample_count: number;
}

export interface PatientBaseline {
  patient_id: string;
  window_start: string;
  window_end: string;
  observation_count: number;
  heart_rate: VitalBaseline;
  spo2: VitalBaseline;
  temperature: VitalBaseline;
}

export interface ZScores {
  heart_rate_z: number;
  spo2_z: number;
  temperature_z: number;
}

export interface TrendMetric {
  direction: TrendDirection;
  slope: number;
  rate_of_change_per_hour: number;
  is_worsening: boolean;
  description: string;
}

export interface TrendAnalysis {
  heart_rate: TrendMetric;
  spo2: TrendMetric;
  temperature: TrendMetric;
  sustained_worsening_detected: boolean;
  sustained_worsening_count: number;
  summary: string;
}

export interface ContributingFactor {
  parameter: string;
  impact: 'high' | 'medium' | 'low';
  factor_type: 'deviation' | 'trend' | 'context';
  message: string;
}

export interface ExplainableAlert {
  headline: string;
  contributing_factors: ContributingFactor[];
  summary_text: string;
  safety_disclaimer: string;
}

export interface RiskPrediction {
  risk_score: number;
  deterioration_probability: number;
  risk_status: RiskStatus;
  model_version: string;
}

export interface AnalysisResult {
  patient_id: string;
  timestamp: string;
  current_reading: VitalReading;
  baseline: PatientBaseline;
  z_scores: ZScores;
  trends: TrendAnalysis;
  risk_prediction: RiskPrediction;
  explainable_alert: ExplainableAlert;
}

export interface PatientSummary {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  bed_id: string;
  admission_time: string;
  baseline: PatientBaseline;
  latest_reading: VitalReading;
  latest_analysis: AnalysisResult;
  data_source_badge: string;
}

export interface SimulatePayload {
  heart_rate: number;
  spo2: number;
  temperature: number;
  motion?: MotionState;
  timestamp?: string;
}
