import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Zap, Sparkles, AlertOctagon, Radio } from 'lucide-react';
import { SimulatePayload, MotionState } from '../types';

interface DemoSimulatorProps {
  onSimulate: (payload: SimulatePayload) => Promise<void>;
  onReset: () => Promise<void>;
  isSimulating: boolean;
}

export const DemoSimulator: React.FC<DemoSimulatorProps> = ({
  onSimulate,
  onReset,
  isSimulating,
}) => {
  const [hr, setHr] = useState<number>(84);
  const [spo2, setSpo2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(36.9);
  const [motion, setMotion] = useState<MotionState>('Normal');
  const [autoStream, setAutoStream] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<number | null>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyScenario = async (scenarioNumber: number) => {
    setActiveScenario(scenarioNumber);
    setErrorMessage(null);
    let payload: SimulatePayload;

    if (scenarioNumber === 1) {
      setHr(84);
      setSpo2(98);
      setTemp(36.9);
      setMotion('Normal');
      payload = { heart_rate: 84, spo2: 98, temperature: 36.9, motion: 'Normal' };
    } else if (scenarioNumber === 2) {
      setHr(98);
      setSpo2(95);
      setTemp(37.2);
      setMotion('Normal');
      payload = { heart_rate: 98, spo2: 95, temperature: 37.2, motion: 'Normal' };
    } else {
      setHr(108);
      setSpo2(93);
      setTemp(37.4);
      setMotion('Restless');
      payload = { heart_rate: 108, spo2: 93, temperature: 37.4, motion: 'Restless' };
    }

    try {
      await onSimulate(payload);
    } catch (err: any) {
      setErrorMessage(err.message || 'Simulation error');
    }
  };

  const handleManualSimulate = async () => {
    setErrorMessage(null);
    try {
      await onSimulate({
        heart_rate: Number(hr),
        spo2: Number(spo2),
        temperature: Number(temp),
        motion: motion,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Validation error');
    }
  };

  useEffect(() => {
    let interval: any;
    if (autoStream) {
      interval = setInterval(() => {
        const nextHr = Math.min(Math.max(hr + (Math.random() * 2 - 1), 60), 140);
        const nextSpo2 = Math.min(Math.max(spo2 + (Math.random() * 0.6 - 0.3), 85), 100);
        const nextTemp = Math.min(Math.max(temp + (Math.random() * 0.08 - 0.04), 35.5), 39.5);
        onSimulate({
          heart_rate: Number(nextHr.toFixed(1)),
          spo2: Number(nextSpo2.toFixed(1)),
          temperature: Number(nextTemp.toFixed(2)),
          motion: motion,
        }).catch(() => {});
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [autoStream, hr, spo2, temp, motion, onSimulate]);

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            LIVE DEMONSTRATION & ICU TELEMETRY SIMULATOR
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAutoStream(!autoStream)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
              autoStream
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoStream ? 'animate-pulse text-white' : 'text-slate-400'}`} />
            {autoStream ? 'STREAMING ACTIVE' : 'Auto Stream Telemetry'}
          </button>

          <button
            onClick={async () => {
              setAutoStream(false);
              setActiveScenario(null);
              setErrorMessage(null);
              await onReset();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-1.5 border border-slate-200 shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Patient P001
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3 Quick Judge Scenario Buttons matching Prompt */}
      <div className="mb-5">
        <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>1-Click Hackathon Scenarios (SIH 2026 Evaluation):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => applyScenario(1)}
            disabled={isSimulating}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative ${
              activeScenario === 1
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200/80 shadow-xs'
                : 'bg-white/90 border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Scenario 1: STABLE</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-600 text-white">
                STABLE
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-800">
              HR 84 | SpO₂ 98% | 36.9°C
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Within patient's normal baseline window.
            </p>
          </button>

          <button
            onClick={() => applyScenario(2)}
            disabled={isSimulating}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative ${
              activeScenario === 2
                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-200/80 shadow-xs'
                : 'bg-white/90 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Scenario 2: WARNING</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                WARNING
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-amber-800">
              HR 98 | SpO₂ 95% | 37.2°C
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Early deviation (+4.9 SD HR climb, desat drift).
            </p>
          </button>

          <button
            onClick={() => applyScenario(3)}
            disabled={isSimulating}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative ${
              activeScenario === 3
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200/80 shadow-xs'
                : 'bg-white/90 border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/30 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-900">Scenario 3: CRITICAL</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                CRITICAL
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-rose-800">
              HR 108 | SpO₂ 93% | 37.4°C
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Acute strain, severe desat, sustained worsening.
            </p>
          </button>
        </div>
      </div>

      <div className="bg-white/90 p-4 rounded-xl border border-slate-200/90 mb-4 shadow-2xs">
        <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
          <span>Custom Reading Fine-Tuning:</span>
          <span className="text-[11px] font-medium text-slate-400">
            Simulate arbitrary ICU vitals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-rose-600 font-bold">Heart Rate</span>
              <span className="font-mono font-bold text-slate-900">{hr} bpm</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={hr}
              onChange={(e) => {
                setHr(Number(e.target.value));
                setActiveScenario(null);
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-sky-600 font-bold">SpO₂</span>
              <span className="font-mono font-bold text-slate-900">{spo2} %</span>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              value={spo2}
              onChange={(e) => {
                setSpo2(Number(e.target.value));
                setActiveScenario(null);
              }}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-600 font-bold">Temperature</span>
              <span className="font-mono font-bold text-slate-900">{temp} °C</span>
            </div>
            <input
              type="range"
              min="35.0"
              max="40.0"
              step="0.1"
              value={temp}
              onChange={(e) => {
                setTemp(Number(e.target.value));
                setActiveScenario(null);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-indigo-600 font-bold">Motion Context</span>
            </div>
            <select
              value={motion}
              onChange={(e) => {
                setMotion(e.target.value as MotionState);
                setActiveScenario(null);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:border-sky-500 font-mono shadow-2xs"
            >
              <option value="Normal">Normal</option>
              <option value="Restless">Restless</option>
              <option value="Fall Detected">Fall Detected</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleManualSimulate}
        disabled={isSimulating}
        className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm tracking-wide text-white bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 shadow-md shadow-sky-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Play className="w-5 h-5 fill-white text-white" />
        <span>SIMULATE NEW READING</span>
      </button>
    </div>
  );
};