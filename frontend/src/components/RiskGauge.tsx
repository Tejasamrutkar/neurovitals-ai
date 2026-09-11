import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Brain, Cpu } from 'lucide-react';
import { RiskPrediction } from '../types';

interface RiskGaugeProps {
  prediction: RiskPrediction | null;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ prediction }) => {
  const status = prediction?.risk_status || 'STABLE';
  const score = prediction?.risk_score || 25;
  const prob = prediction?.deterioration_probability || 25;

  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50/70',
          border: 'border-rose-300 ring-2 ring-rose-200/80',
          text: 'text-rose-700',
          badge: 'bg-rose-600 text-white shadow-xs',
          bar: 'bg-rose-600',
          glow: 'shadow-sm shadow-rose-200/60'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50/70',
          border: 'border-amber-300 ring-1 ring-amber-200/80',
          text: 'text-amber-700',
          badge: 'bg-amber-500 text-slate-950 shadow-xs',
          bar: 'bg-amber-500',
          glow: 'shadow-sm shadow-amber-200/60'
        };
      default:
        return {
          bg: 'bg-emerald-50/60',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600 text-white shadow-xs',
          bar: 'bg-emerald-600',
          glow: 'shadow-sm shadow-emerald-100/60'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`glass-panel rounded-2xl p-5 shadow-sm transition-all duration-500 ${colors.bg} ${colors.border} ${colors.glow}`}>
      {/* Top title */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            AI RISK PREDICTION
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-semibold">scikit-learn Temporal ML</span>
        </div>
      </div>

      {/* Main Status Pill */}
      <div className="flex items-center justify-between mb-5 bg-white/90 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <span className="text-xs text-slate-600 font-semibold">Predicted Clinical State:</span>
        <div className="flex items-center gap-2">
          {status === 'CRITICAL' && <AlertOctagon className="w-5 h-5 text-rose-600 animate-bounce" />}
          {status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
          {status === 'STABLE' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
          <span className={`px-3.5 py-1 rounded-lg text-xs font-mono font-extrabold tracking-wider ${colors.badge}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Deterioration Probability */}
        <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Deterioration Prob.
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-extrabold font-mono ${colors.text}`}>
              {prob.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${Math.min(prob, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Composite Risk Score */}
        <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Risk Score
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {score.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono font-semibold">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${Math.min(score, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Range Interpretation Scale */}
      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5 shadow-2xs">
        <div className="flex justify-between font-mono text-[10px] font-bold">
          <span className="text-emerald-700">STABLE (&lt;40)</span>
          <span className="text-amber-700">WARNING (40-70)</span>
          <span className="text-rose-700">CRITICAL (&gt;70)</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-90"></div>
      </div>
    </div>
  );
};