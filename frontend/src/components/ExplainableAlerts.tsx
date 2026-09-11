import React from 'react';
import { Lightbulb, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ExplainableAlert, ContributingFactor } from '../types';

interface ExplainableAlertsProps {
  alert: ExplainableAlert | null;
}

export const ExplainableAlerts: React.FC<ExplainableAlertsProps> = ({ alert }) => {
  if (!alert) return null;

  const getImpactBadge = (impact: ContributingFactor['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            EXPLAINABLE AI INSIGHT
          </h2>
        </div>
        <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-bold">
          Feature Attribution
        </span>
      </div>

      {/* Headline */}
      <div className="mb-4 bg-white/90 p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <p className="text-xs font-bold text-slate-800">
          {alert.headline}
        </p>
      </div>

      {/* Contributing factors list */}
      <div className="space-y-2.5 mb-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span>Major Contributing Factors:</span>
        </div>

        {alert.contributing_factors.map((factor, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/90 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition"
          >
            <div className="mt-0.5 shrink-0">
              {factor.impact === 'high' ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : factor.impact === 'medium' ? (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {factor.parameter}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${getImpactBadge(
                    factor.impact
                  )}`}
                >
                  {factor.impact} impact
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {factor.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Regulatory/Safety Disclaimer */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Mathematical feature attribution only. No medical diagnosis or treatment recommendations provided.
        </span>
      </div>
    </div>
  );
};