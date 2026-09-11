import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Flame, Brain, Info } from 'lucide-react';
import { RiskStatus } from '../types';

interface VisualStoryBarProps {
  currentStatus: RiskStatus;
}

export const VisualStoryBar: React.FC<VisualStoryBarProps> = ({ currentStatus }) => {
  const steps = [
    { label: 'PATIENT NORMAL', sub: 'Learned Baseline Window', icon: CheckCircle2, status: 'normal' },
    { label: 'CURRENT CHANGE', sub: 'Continuous Telemetry', icon: Info, status: 'normal' },
    { label: 'DEVIATION', sub: 'Z-Score Analysis (Z)', icon: AlertTriangle, status: currentStatus !== 'STABLE' ? 'warning' : 'normal' },
    { label: 'TREND ANALYSIS', sub: 'Sequential Rate-of-Change', icon: Flame, status: currentStatus !== 'STABLE' ? 'warning' : 'normal' },
    { label: 'AI RISK', sub: 'Temporal ML Model', icon: Brain, status: currentStatus === 'CRITICAL' ? 'critical' : currentStatus === 'WARNING' ? 'warning' : 'normal' },
    { label: 'EXPLAINABLE ALERT', sub: 'Factor Breakdown', icon: Info, status: currentStatus === 'CRITICAL' ? 'critical' : currentStatus === 'WARNING' ? 'warning' : 'normal' },
  ];

  const getStepBg = (status: string) => {
    if (status === 'critical') return 'border-rose-300/90 bg-rose-50/90 text-rose-900 shadow-sm shadow-rose-200/50 ring-1 ring-rose-300/60';
    if (status === 'warning') return 'border-amber-300/90 bg-amber-50/90 text-amber-900 shadow-sm shadow-amber-200/50 ring-1 ring-amber-300/60';
    return 'border-slate-200/90 bg-white/75 text-slate-700 shadow-xs hover:border-slate-300';
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 mb-6">
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 text-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div
                className={`flex-1 min-w-[135px] p-2.5 rounded-xl border flex items-center gap-2.5 transition-all duration-300 backdrop-blur-md ${getStepBg(step.status)}`}
              >
                <div className="p-1.5 rounded-lg bg-white/90 shadow-xs shrink-0 border border-slate-200/60">
                  <Icon className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <div className="truncate">
                  <p className="font-bold tracking-tight text-[11px] truncate text-slate-900">{step.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{step.sub}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};