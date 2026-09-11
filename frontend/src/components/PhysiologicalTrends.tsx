import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid
} from 'recharts';
import { VitalReading, PatientBaseline } from '../types';
import { Activity, Heart, Droplets, Thermometer } from 'lucide-react';

interface PhysiologicalTrendsProps {
  history: VitalReading[];
  baseline: PatientBaseline | null;
}

export const PhysiologicalTrends: React.FC<PhysiologicalTrendsProps> = ({ history, baseline }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hr' | 'spo2' | 'temp'>('all');

  const chartData = history.map((reading) => ({
    timestamp: reading.timestamp,
    heart_rate: reading.heart_rate,
    spo2: reading.spo2,
    temperature: reading.temperature,
    motion: reading.motion,
  }));

  const hrMean = baseline?.heart_rate.mean ?? 75;
  const hrStd = baseline?.heart_rate.std ?? 4.8;
  const spo2Mean = baseline?.spo2.mean ?? 98.5;
  const spo2Std = baseline?.spo2.std ?? 1.0;
  const tempMean = baseline?.temperature.mean ?? 36.7;
  const tempStd = baseline?.temperature.std ?? 0.25;

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-sm">
      {/* Header with Title and Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            PHYSIOLOGICAL TRENDS & BASELINE REFERENCE
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono font-semibold border border-slate-200">
            {history.length} Data Points
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stacked View
          </button>
          <button
            onClick={() => setActiveTab('hr')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
              activeTab === 'hr'
                ? 'bg-white text-rose-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" /> HR
          </button>
          <button
            onClick={() => setActiveTab('spo2')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
              activeTab === 'spo2'
                ? 'bg-white text-sky-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" /> SpO₂
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
              activeTab === 'temp'
                ? 'bg-white text-amber-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp
          </button>
        </div>
      </div>

      {/* Legend & Baseline explanation */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-rose-500 rounded-full inline-block"></span>
          <span>Heart Rate (bpm)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-sky-500 rounded-full inline-block"></span>
          <span>SpO₂ (%)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-1 bg-amber-500 rounded-full inline-block"></span>
          <span>Temp (°C)</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-3.5 h-3.5 bg-emerald-100 border border-emerald-300 rounded-md inline-block"></span>
          <span className="text-emerald-800 text-[11px] font-mono font-bold">Personal Normal Range (Mean ± 2 SD)</span>
        </div>
      </div>

      {/* Charts Display */}
      <div className="space-y-4">
        {/* Heart Rate Chart */}
        {(activeTab === 'all' || activeTab === 'hr') && (
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-rose-700 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" /> Heart Rate (HR)
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-medium">
                Baseline: {hrMean.toFixed(1)} ± {hrStd.toFixed(1)} bpm
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[55, 125]} stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', borderColor: '#cbd5e1', borderRadius: '10px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <ReferenceArea
                    y1={hrMean - 2 * hrStd}
                    y2={hrMean + 2 * hrStd}
                    fill="#10b981"
                    fillOpacity={0.10}
                  />
                  <ReferenceLine y={hrMean} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#059669', fontSize: 10, position: 'insideRight' }} />
                  <Line
                    type="monotone"
                    dataKey="heart_rate"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#e11d48' }}
                    activeDot={{ r: 5, fill: '#f43f5e' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SpO2 Chart */}
        {(activeTab === 'all' || activeTab === 'spo2') && (
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-sky-700 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-500" /> Oxygen Saturation (SpO₂)
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-medium">
                Baseline: {spo2Mean.toFixed(1)} ± {spo2Std.toFixed(1)} %
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[90, 100]} stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', borderColor: '#cbd5e1', borderRadius: '10px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <ReferenceArea
                    y1={Math.max(spo2Mean - 2 * spo2Std, 95)}
                    y2={100}
                    fill="#10b981"
                    fillOpacity={0.10}
                  />
                  <ReferenceLine y={spo2Mean} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#059669', fontSize: 10, position: 'insideRight' }} />
                  <Line
                    type="monotone"
                    dataKey="spo2"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#0284c7' }}
                    activeDot={{ r: 5, fill: '#38bdf8' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Temperature Chart */}
        {(activeTab === 'all' || activeTab === 'temp') && (
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-bold text-amber-700 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-500" /> Core Body Temperature
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-medium">
                Baseline: {tempMean.toFixed(2)} ± {tempStd.toFixed(2)} °C
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[36.0, 38.2]} stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.96)', borderColor: '#cbd5e1', borderRadius: '10px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <ReferenceArea
                    y1={tempMean - 2 * tempStd}
                    y2={tempMean + 2 * tempStd}
                    fill="#10b981"
                    fillOpacity={0.10}
                  />
                  <ReferenceLine y={tempMean} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Baseline', fill: '#059669', fontSize: 10, position: 'insideRight' }} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#d97706' }}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};