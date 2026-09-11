import React from 'react';
import { Activity, ShieldAlert, User, Bed, Clock } from 'lucide-react';
import { PatientSummary } from '../types';

interface HeaderProps {
  patient: PatientSummary | null;
}

export const Header: React.FC<HeaderProps> = ({ patient }) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      {/* Top Academic Safety Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-1.5 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Academic Prototype — Not for Clinical Diagnosis. Built for SIH 2026 MedTech / HealthTech Innovation.</span>
        <span className="bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded text-[11px] font-mono ml-2 border border-amber-300/80">
          DEMO / SIMULATED ICU DATA
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Concept */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-1 ring-sky-300">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                NEUROVITALS <span className="text-sky-600 font-mono">AI</span>
              </h1>
              <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200 shadow-xs">
                ICU EARLY WARNING
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Continuous Physiological Pattern Analysis & Personalized Baseline Deviation
            </p>
          </div>
        </div>

        {/* Center: Live Telemetry Indicator */}
        <div className="flex items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="live-indicator absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-700">
            LIVE TELEMETRY
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs font-mono text-slate-600 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {patient?.latest_reading.timestamp || '08:00:00'}
          </span>
        </div>

        {/* Right: Patient Demographics */}
        <div className="flex items-center space-x-3 bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold text-slate-900 font-mono">{patient?.patient_id || 'P001'}</span>
            <span className="text-slate-500">({patient?.patient_name || 'Eleanor Vance'}, {patient?.age || 64}y, {patient?.gender || 'F'})</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-700">
            <Bed className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono font-semibold text-indigo-700">{patient?.bed_id || 'ICU-Bed-04'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};