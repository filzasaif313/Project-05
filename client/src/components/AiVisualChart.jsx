import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AiVisualChart({ chart }) {
  if (!chart) return null;

  const { type, title, subtitle, points, bars, currentValue } = chart;

  return (
    <div className="mt-3 w-full rounded-2xl bg-[#0C0A09] border border-[#38332E] p-3.5 shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[#38332E] pb-2.5 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FAFAF9]">
            {type === 'line' ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
            ) : (
              <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
            )}
            <span>{title}</span>
          </div>
          {subtitle && (
            <p className="text-[10px] text-[#A8A29E] font-mono mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {currentValue !== undefined && (
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-[#78716C] block">Current</span>
            <span className="text-xs font-black font-mono text-[#FBBF24]">{currentValue} units</span>
          </div>
        )}
      </div>

      {/* Chart Body */}
      {type === 'line' && points && points.length > 0 && (
        <LineChartRenderer points={points} />
      )}

      {type === 'bar' && bars && bars.length > 0 && (
        <BarChartRenderer bars={bars} />
      )}
    </div>
  );
}

function LineChartRenderer({ points }) {
  const width = 360;
  const height = 150;
  const padding = { top: 20, right: 20, bottom: 28, left: 32 };

  const values = points.map(p => p.value);
  const minVal = 0;
  const maxVal = Math.max(...values, 10) * 1.15;

  const getX = (index) => {
    if (points.length <= 1) return padding.left + (width - padding.left - padding.right) / 2;
    return padding.left + (index / (points.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val) => {
    return height - padding.bottom - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);
  };

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${getX(points.length - 1).toFixed(1)} ${height - padding.bottom} L ${getX(0).toFixed(1)} ${height - padding.bottom} Z`;

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="lineFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const val = Math.round(minVal + (maxVal - minVal) * pct);
          const y = getY(val);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#38332E"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                fill="#78716C"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Area */}
        <path d={areaD} fill="url(#lineFillGrad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((p, i) => {
          const x = getX(i);
          const y = getY(p.value);
          return (
            <g key={i} className="group">
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="#0C0A09"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x={x}
                y={height - 8}
                fill="#A8A29E"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BarChartRenderer({ bars }) {
  const maxVal = Math.max(...bars.map(b => b.value || 0), 1);

  return (
    <div className="space-y-2 py-1">
      {bars.map((bar, idx) => {
        const pct = Math.max(8, Math.min(100, Math.round((bar.value / maxVal) * 100)));
        const isCritical = bar.isCritical || (bar.threshold && bar.value <= bar.threshold);

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#FAFAF9] truncate max-w-[200px]" title={bar.fullName || bar.label}>
                {bar.fullName || bar.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {isCritical && (
                  <span className="text-[9px] text-[#EF4444] flex items-center gap-0.5 font-bold">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Low
                  </span>
                )}
                <span className="font-bold text-[#FBBF24]">{bar.value} units</span>
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full h-2 rounded-full bg-[#38332E] overflow-hidden flex items-center">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
