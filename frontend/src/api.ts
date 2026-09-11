import { PatientSummary, VitalReading, AnalysisResult, SimulatePayload } from './types';

// Adaptive API URL: supports both standalone Vite dev mode (port 5173) and unified production server / cloud URL
const API_BASE = window.location.port === '5173' ? 'http://127.0.0.1:8000/api' : '/api';

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchPatient(): Promise<PatientSummary> {
  const res = await fetch(`${API_BASE}/patient`);
  if (!res.ok) throw new Error(`Failed to fetch patient: ${res.statusText}`);
  return res.json();
}

export async function fetchHistory(): Promise<VitalReading[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error(`Failed to fetch history: ${res.statusText}`);
  return res.json();
}

export async function fetchAlerts(): Promise<AnalysisResult[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  return res.json();
}

export async function simulateReading(payload: SimulatePayload): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function resetPatient(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error(`Reset failed: ${res.statusText}`);
  return res.json();
}