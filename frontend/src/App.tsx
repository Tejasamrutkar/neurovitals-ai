import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { VisualStoryBar } from './components/VisualStoryBar';
import { VitalCard } from './components/VitalCard';
import { PhysiologicalTrends } from './components/PhysiologicalTrends';
import { RiskGauge } from './components/RiskGauge';
import { ExplainableAlerts } from './components/ExplainableAlerts';
import { DemoSimulator } from './components/DemoSimulator';
import { AlertTimeline } from './components/AlertTimeline';
import { fetchPatient, fetchHistory, fetchAlerts, simulateReading, resetPatient } from './api';
import { PatientSummary, VitalReading, AnalysisResult, SimulatePayload } from './types';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [history, setHistory] = useState<VitalReading[]>([]);
  const [alerts, setAlerts] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [pData, hData, aData] = await Promise.all([
        fetchPatient(),
        fetchHistory(),
        fetchAlerts(),
      ]);
      setPatient(pData);
      setHistory(hData);
      setAlerts(aData);
    } catch (err: any) {
      console.error('Failed to load patient data:', err);
      setError('Could not connect to NeuroVitals AI backend. Please ensure the Python server is running on http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSimulate = async (payload: SimulatePayload) => {
    setSimulating(true);
    try {
      const result = await simulateReading(payload);
      if (patient) {
        setPatient({
          ...patient,
          latest_reading: result.current_reading,
          latest_analysis: result,
        });
      }
      setHistory((prev) => [...prev, result.current_reading]);
      if (result.risk_prediction.risk_status !== 'STABLE' || alerts.length === 0) {
        setAlerts((prev) => [...prev, result]);
      }
    } catch (err: any) {
      console.error('Simulation failed:', err);
      throw err;
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    setSimulating(true);
    try {
      await resetPatient();
      await loadData();
    } catch (err: any) {
      console.error('Reset failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center shadow-lg border border-white/80">
          <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
          <p className="font-mono text-sm font-bold tracking-wider text-slate-800">INITIALIZING NEUROVITALS AI ENGINE...</p>
          <p className="text-xs text-slate-500 mt-1">Calibrating personalized baseline for Patient P001</p>
        </div>
      </div>
    );
  }

  const analysis = patient?.latest_analysis;
  const currentReading = patient?.latest_reading;
  const baseline = patient?.baseline;
  const currentStatus = analysis?.risk_prediction.risk_status || 'STABLE';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 text-slate-900 flex flex-col relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Background ambient diffused glass blooms */}
      <div className="pointer-events-none fixed -top-24 -left-24 w-96 h-96 rounded-full bg-sky-200/35 blur-3xl"></div>
      <div className="pointer-events-none fixed top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl"></div>
      <div className="pointer-events-none fixed -bottom-24 left-1/4 w-[32rem] h-[32rem] rounded-full bg-teal-200/25 blur-3xl"></div>

      {/* Header */}
      <Header patient={patient} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Visual Story Ribbon: Normal -> Change -> Deviation -> Trend -> AI Risk -> Explainable Alert */}
        <VisualStoryBar currentStatus={currentStatus} />

        {/* 4 Vital Signs Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <VitalCard
            type="hr"
            title="Heart Rate"
            currentValue={currentReading?.heart_rate ?? 74}
            unit="bpm"
            baseline={baseline?.heart_rate}
            zScore={analysis?.z_scores.heart_rate_z}
            trend={analysis?.trends.heart_rate}
          />
          <VitalCard
            type="spo2"
            title="Oxygen Saturation"
            currentValue={currentReading?.spo2 ?? 98}
            unit="%"
            baseline={baseline?.spo2}
            zScore={analysis?.z_scores.spo2_z}
            trend={analysis?.trends.spo2}
          />
          <VitalCard
            type="temp"
            title="Core Temperature"
            currentValue={currentReading?.temperature ?? 36.7}
            unit="°C"
            baseline={baseline?.temperature}
            zScore={analysis?.z_scores.temperature_z}
            trend={analysis?.trends.temperature}
          />
          <VitalCard
            type="motion"
            title="Activity & Fall"
            currentValue={currentReading?.motion ?? 'Normal'}
            unit=""
          />
        </div>

        {/* Two-Column Grid: Trends & Simulator vs AI Risk & Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Charts + Live Simulator */}
          <div className="lg:col-span-7 space-y-6">
            <PhysiologicalTrends history={history} baseline={baseline || null} />
            <DemoSimulator
              onSimulate={handleSimulate}
              onReset={handleReset}
              isSimulating={simulating}
            />
          </div>

          {/* Right Column (5 cols): AI Risk Gauge + Explainable AI Insights + Timeline */}
          <div className="lg:col-span-5 space-y-6">
            <RiskGauge prediction={analysis?.risk_prediction || null} />
            <ExplainableAlerts alert={analysis?.explainable_alert || null} />
            <AlertTimeline alerts={alerts} />
          </div>
        </div>
      </main>

      {/* Footer with Academic SIH Details */}
      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-4 mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800">NeuroVitals AI</span> — Smart India Hackathon (SIH 2026) Student Innovation Project
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            MIMIC-IV Telemetry Architecture Ready • Python FastAPI + React TypeScript
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;