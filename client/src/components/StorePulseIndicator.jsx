import React from 'react';

/**
 * STORE PULSE Status Engine (Zero Blue, Zero Green, Zero Purple):
 * - HEALTHY: calm static indicator in Sun Gold (#FBBF24)
 * - MOVING_FAST: active high-velocity item with Amber Gold (#F59E0B) radar
 * - LOW: subtle breathing warning indicator in Sunset Ember (#F97316)
 * - OUT_OF_STOCK: critical alert indicator in Crimson Red (#EF4444)
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
      color: 'bg-[#FBBF24]',
      textColor: 'text-[#FBBF24]',
      border: 'border-[#FBBF24]/30',
      bgBadge: 'bg-[#FBBF24]/15',
      description: 'Stock levels well above safety threshold',
      ping: false,
    },
    MOVING_FAST: {
      label: 'Moving Fast',
      color: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/40',
      bgBadge: 'bg-[#F59E0B]/15',
      description: 'High turnover / actively selling',
      ping: true,
    },
    LOW: {
      label: 'Low Stock',
      color: 'bg-[#F97316]',
      textColor: 'text-[#F97316]',
      border: 'border-[#F97316]/35',
      bgBadge: 'bg-[#F97316]/15',
      description: 'At or below reorder threshold',
      ping: 'breathe',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      color: 'bg-[#EF4444]',
      textColor: 'text-[#EF4444]',
      border: 'border-[#EF4444]/35',
      bgBadge: 'bg-[#EF4444]/15',
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
          <span className="absolute -inset-1 rounded-full bg-[#EF4444]/40 animate-pulse" />
        )}
        {/* Central Core Indicator */}
        <span className={`relative inline-flex rounded-full ${dotSize} ${config.color} shadow-sm`} />
      </div>

      {showLabel && (
        <span className={`text-[10px] font-mono font-semibold tracking-wide uppercase px-2 py-0.5 rounded border ${config.bgBadge} ${config.textColor} ${config.border}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
