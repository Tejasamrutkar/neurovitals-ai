import React from 'react';
import { Heart, Droplets, Thermometer, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { VitalBaseline, TrendMetric, MotionState } from '../types';

interface VitalCardProps {
  type: 'hr' | 'spo2' | 'temp' | 'motion';
  title: string;
  currentValue: number | MotionState;
  unit: string;
  baseline?: VitalBaseline;
  zScore?: number;
  trend?: TrendMetric;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  title,
  currentValue,
  unit,
  baseline,
  zScore,
  trend
}) => {
  const getIcon = () => {
    switch (type) {
      case 'hr': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'spo2': return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'temp': return <Thermometer className="w-5 h-5 text-amber-500" />;
      case 'motion': return <Activity className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'hr': return 'bg-rose-50 border-rose-100';
      case 'spo2': return 'bg-sky-50 border-sky-100';
      case 'temp': return 'bg-amber-50 border-amber-100';
      case 'motion': return 'bg-indigo-50 border-indigo-100';
    }
  };

  const getZBadge = (z: number | undefined) => {
    if (z === undefined) return null;
    const absZ = Math.abs(z);
    let color = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    if (absZ >= 3.5) {
      color = 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold';
    } else if (absZ >= 2.0) {
      color = 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
    }

    return (
      <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${color} shadow-2xs`}>
        <span>Z = {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)} SD</span>
      </div>
    );
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'increasing') {
      return <TrendingUp className={`w-4 h-4 ${trend.is_worsening ? 'text-rose-600' : 'text-slate-500'}`} />;
    } else if (trend.direction === 'decreasing') {
      return <TrendingDown className={`w-4 h-4 ${trend.is_worsening ? 'text-rose-600' : 'text-slate-500'}`} />;
    }
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const isDeviated = zScore !== undefined && Math.abs(zScore) >= 3.0;
  const isWarning = zScore !== undefined && Math.abs(zScore) >= 2.0;

  return (
    <div
      className={`glass-panel rounded-2xl p-4.5 shadow-sm transition-all duration-300 ${
        isDeviated
          ? 'border-rose-300/90 ring-2 ring-rose-200/60 bg-rose-50/40 shadow-rose-100/50'
          : isWarning
          ? 'border-amber-300/90 ring-1 ring-amber-200/50 bg-amber-50/30 shadow-amber-100/40'
          : 'hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top row: Name, Icon, Z-score badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${getIconBg()} shadow-2xs`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {type === 'motion' ? 'Contextual' : 'Continuous'}
            </span>
          </div>
        </div>
        {getZBadge(zScore)}
      </div>

      {/* Center: Current Value */}
      <div className="my-2.5">
        {type === 'motion' ? (
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-bold font-mono px-3.5 py-1.5 rounded-xl border shadow-2xs ${
                currentValue === 'Fall Detected'
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-bounce'
                  : currentValue === 'Restless'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {currentValue}
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900">
              {typeof currentValue === 'number' ? (type === 'temp' ? currentValue.toFixed(1) : Math.round(currentValue)) : currentValue}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">{unit}</span>
          </div>
        )}
      </div>

      {/* Bottom details: Baseline & Trend */}
      {baseline && (
        <div className="pt-2.5 mt-2.5 border-t border-slate-200/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px]">Personal Baseline:</span>
            <span className="font-mono text-slate-800 font-bold">
              {baseline.mean} ± {baseline.std} {baseline.unit}
            </span>
          </div>

          {trend && (
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] flex items-center gap-1">
                {getTrendIcon()}
                <span>Trend:</span>
              </span>
              <span
                className={`font-mono text-[11px] font-semibold ${
                  trend.is_worsening ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {trend.description}
              </span>
            </div>
          )}
        </div>
      )}

      {type === 'motion' && (
        <div className="pt-2.5 mt-2.5 border-t border-slate-200/80 text-xs text-slate-500">
          <p className="text-[11px]">
            Contextual motion correlation prevents false alarms from posture shifts.
          </p>
        </div>
      )}
    </div>
  );
};