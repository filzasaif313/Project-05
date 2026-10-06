import React from 'react';

/**
 * STORE PULSE Status Engine:
 * - HEALTHY: calm static indicator in muted sage (#8FAF87)
 * - MOVING_FAST: active high-velocity item with gentle pulse radar
 * - LOW: subtle breathing warning indicator in soft amber (#D6A85F)
 * - OUT_OF_STOCK: critical indicator in muted brick (#C65A4A)
 */
export function getStorePulseStatus(totalStock, lowStockThreshold, isFastMoving = false) {
  if (totalStock <= 0) return 'OUT_OF_STOCK';
  if (totalStock <= lowStockThreshold) return 'LOW';
  if (isFastMoving || totalStock >= 25) return 'MOVING_FAST';
  return 'HEALTHY';
}

export default function StorePulseIndicator({ status, size = 'sm', showLabel = true }) {
  const configs = {
    HEALTHY: {
      label: 'Healthy',
      color: 'bg-[#8FAF87]',
      textColor: 'text-[#8FAF87]',
      border: 'border-[#8FAF87]/30',
      bgBadge: 'bg-[#8FAF87]/15',
      description: 'Stock levels well above safety threshold',
      ping: false,
    },
    MOVING_FAST: {
      label: 'Moving Fast',
      color: 'bg-[#8FAF87]',
      textColor: 'text-[#8FAF87]',
      border: 'border-[#8FAF87]/40',
      bgBadge: 'bg-[#8FAF87]/20',
      description: 'High turnover / actively selling',
      ping: true,
    },
    LOW: {
      label: 'Low Stock',
      color: 'bg-[#D6A85F]',
      textColor: 'text-[#D6A85F]',
      border: 'border-[#D6A85F]/35',
      bgBadge: 'bg-[#D6A85F]/15',
      description: 'At or below reorder threshold',
      ping: 'breathe',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      color: 'bg-[#C65A4A]',
      textColor: 'text-[#C65A4A]',
      border: 'border-[#C65A4A]/35',
      bgBadge: 'bg-[#C65A4A]/15',
      description: 'Zero units on shelf and backroom',
      ping: 'alert',
    },
  };

  const config = configs[status] || configs.HEALTHY;
  const dotSize = size === 'lg' ? 'w-3 h-3' : size === 'md' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {/* Radar / Pulse ring */}
        {config.ping === true && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75 animate-ping`} />
        )}
        {config.ping === 'breathe' && (
          <span className={`absolute -inset-1 rounded-full ${config.color}/35 animate-pulse`} />
        )}
        {config.ping === 'alert' && (
          <span className="absolute -inset-1 rounded-full bg-[#C65A4A]/40 animate-pulse" />
        )}
        {/* Central Core Indicator */}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.color} shadow-sm`} />
      </div>

      {showLabel && (
        <span className={`text-[11px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${config.bgBadge} ${config.textColor} ${config.border}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
