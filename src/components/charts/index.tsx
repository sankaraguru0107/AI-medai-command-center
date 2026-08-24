import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Color palette
const COLORS = {
  blue: '#0c90e6',
  teal: '#0d9488',
  violet: '#7c3aed',
  amber: '#d97706',
  rose: '#e11d48',
  emerald: '#059669',
  slate: '#64748b',
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-200 rounded-xl p-3 shadow-glass text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-semibold text-slate-700">{entry.value}{unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Vitals Area Chart
interface VitalsChartProps {
  data: Array<{ time: string; hr?: number; spo2?: number; bp_sys?: number; bp_dia?: number; temp?: number }>;
  metrics?: ('hr' | 'spo2' | 'bp_sys' | 'bp_dia' | 'temp')[];
  height?: number;
}

export const VitalsChart: React.FC<VitalsChartProps> = ({
  data,
  metrics = ['hr', 'spo2'],
  height = 180,
}) => {
  const metricConfig = {
    hr: { color: COLORS.rose, label: 'HR (bpm)' },
    spo2: { color: COLORS.blue, label: 'SpO2 (%)' },
    bp_sys: { color: COLORS.amber, label: 'SBP (mmHg)' },
    bp_dia: { color: COLORS.violet, label: 'DBP (mmHg)' },
    temp: { color: COLORS.teal, label: 'Temp (°F)' },
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          {metrics.map(m => (
            <linearGradient key={m} id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metricConfig[m].color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={metricConfig[m].color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        {metrics.map(m => (
          <Area
            key={m}
            type="monotone"
            dataKey={m}
            name={metricConfig[m].label}
            stroke={metricConfig[m].color}
            strokeWidth={2}
            fill={`url(#grad-${m})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Bed Occupancy Bar Chart
interface BedOccupancyChartProps {
  data: Array<{ unit: string; occupied: number; total: number }>;
  height?: number;
}

export const BedOccupancyChart: React.FC<BedOccupancyChartProps> = ({ data, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey="unit" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
      <Bar dataKey="occupied" name="Occupied" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
      <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// Risk Score Donut Chart
interface RiskDonutProps {
  score: number; // 0-100
  label?: string;
  size?: number;
}

export const RiskDonut: React.FC<RiskDonutProps> = ({ score, label = 'Risk', size = 120 }) => {
  const color = score >= 70 ? COLORS.rose : score >= 40 ? COLORS.amber : COLORS.emerald;
  const data = [{ value: score }, { value: 100 - score }];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2 - 1}
          cy={size / 2 - 1}
          innerRadius={size * 0.35}
          outerRadius={size * 0.46}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="#f1f5f9" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-display" style={{ color }}>{score}</span>
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
      </div>
    </div>
  );
};

// Trend Line Chart
interface TrendChartProps {
  data: Array<Record<string, string | number>>;
  lines: Array<{ key: string; label: string; color?: string }>;
  height?: number;
  xKey?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  lines,
  height = 180,
  xKey = 'date',
}) => {
  const palette = [COLORS.blue, COLORS.teal, COLORS.violet, COLORS.amber, COLORS.rose];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color || palette[i % palette.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Claims Distribution Pie
interface ClaimsDistributionProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
}

export const ClaimsDistribution: React.FC<ClaimsDistributionProps> = ({ data, height = 180 }) => {
  const palette = [COLORS.blue, COLORS.teal, COLORS.violet, COLORS.amber, COLORS.rose, COLORS.emerald];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={65}
          innerRadius={35}
          dataKey="value"
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}%`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
