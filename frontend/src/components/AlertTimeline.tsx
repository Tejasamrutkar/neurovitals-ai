import React from 'react';
import { Clock, History } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AlertTimelineProps {
  alerts: AnalysisResult[];
}

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ alerts }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            PATIENT HISTORY & ALERT TIMELINE
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Last {alerts.length} Events
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {alerts.slice().reverse().map((entry, idx) => {
          const status = entry.risk_prediction.risk_status;
          const isCritical = status === 'CRITICAL';
          const isWarning = status === 'WARNING';

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs transition shadow-2xs ${
                isCritical
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : isWarning
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-white/90 border-slate-200/90 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-700 font-bold">{entry.timestamp}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-2xs ${
                    isCritical
                      ? 'bg-rose-600 text-white'
                      : isWarning
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {status} (Risk: {entry.risk_prediction.risk_score.toFixed(0)})
                </span>
              </div>

              {/* Vitals Snapshot */}
              <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] mb-1.5 font-medium">
                <span>HR: <strong className="text-slate-900 font-bold">{entry.current_reading.heart_rate}</strong> bpm</span>
                <span>SpO₂: <strong className="text-slate-900 font-bold">{entry.current_reading.spo2}</strong>%</span>
                <span>Temp: <strong className="text-slate-900 font-bold">{entry.current_reading.temperature}</strong>°C</span>
                <span className="text-slate-500">Motion: {entry.current_reading.motion}</span>
              </div>

              {/* Summary note */}
              <p className="text-slate-500 text-[11px] line-clamp-1 font-medium">
                {entry.explainable_alert.contributing_factors[0]?.message || 'Routine telemetry evaluation.'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};