import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  DollarSign, 
  PackageCheck, 
  ChevronRight, 
  Bot,
  Clock
} from 'lucide-react';

export default function StorePulseOverview({ 
  items = [], 
  movements = [], 
  analytics = null, 
  onNavigateTab, 
  onTriggerAiPrompt 
}) {
  const { isManager, user } = useAuth();

  // Compute Store Pulse status breakdown from real items
  const totalUnits = items.reduce((sum, item) => sum + (parseInt(item.total_stock, 10) || 0), 0);
  const lowStockItems = items.filter(item => item.total_stock <= item.low_stock_threshold && item.total_stock > 0);
  const outOfStockItems = items.filter(item => item.total_stock <= 0);
  const healthyItems = items.filter(item => item.total_stock > item.low_stock_threshold);

  const healthyPercent = items.length > 0 ? Math.round((healthyItems.length / items.length) * 100) : 100;
  const lowPercent = items.length > 0 ? Math.round((lowStockItems.length / items.length) * 100) : 0;
  const outPercent = items.length > 0 ? Math.round((outOfStockItems.length / items.length) * 100) : 0;

  const topSellers = analytics?.topSellers || [];
  const recentMovements = movements.slice(0, 6);

  return (
    <div className="space-y-5">
      
      {/* 1. Terminal Telemetry Header */}
      <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl p-5 relative overflow-hidden">
        
        {/* Subtle background ambient pulse glow */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-[#F59E0B]/5 pointer-events-none blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-[#FBBF24] uppercase font-bold">
                STORE PULSE • OPERATIONAL
              </span>
              <span className="text-[#78716C] text-xs">•</span>
              <span className="text-[10px] text-[#A8A29E] font-mono">
                {isManager ? 'COMMAND CONSOLE' : 'FLOOR DESK'}
              </span>
            </div>
            
            <h1 className="text-2xl font-extrabold text-[#FAFAF9] tracking-tight">
              {isManager ? `Overview • ${user?.name || 'Manager'}` : `Overview • ${user?.name || 'Staff'}`}
            </h1>
            
            <p className="text-xs text-[#A8A29E] mt-1 max-w-2xl leading-relaxed">
              {isManager 
                ? 'Nowshera Shopping Mall real-time stock velocity, catalog ledger, and valuation synchronized with PostgreSQL.' 
                : 'Nowshera Shopping Mall active floor operations. Record goods received, verify shelf locations, and query Store Brain.'}
            </p>
          </div>

          {/* Store Health Telemetry Gauge */}
          <div className="bg-[#0C0A09] border border-[#38332E] px-4 py-3 rounded-xl shrink-0 flex items-center gap-3.5">
            <div className="text-right">
              <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-semibold font-mono">Inventory Health</p>
              <p className="text-sm font-extrabold text-[#FAFAF9] flex items-center justify-end gap-1.5 mt-0.5 font-mono">
                <span className={outOfStockItems.length > 0 ? 'text-[#EF4444]' : lowStockItems.length > 0 ? 'text-[#F97316]' : 'text-[#FBBF24]'}>
                  {healthyPercent}% Nominal
                </span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#292524] border border-[#38332E] flex items-center justify-center">
              <Activity className={`w-4 h-4 ${outOfStockItems.length > 0 ? 'text-[#EF4444]' : lowStockItems.length > 0 ? 'text-[#F97316]' : 'text-[#FBBF24]'}`} />
            </div>
          </div>
        </div>

        {/* Multi-Segment Health Meter */}
        <div className="mt-4 pt-3.5 border-t border-[#38332E]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A29E] mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Healthy: {healthyItems.length} ({healthyPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
              Low Stock: {lowStockItems.length} ({lowPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              Out: {outOfStockItems.length} ({outPercent}%)
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#0C0A09] rounded-full overflow-hidden flex gap-0.5">
            <div style={{ width: `${healthyPercent}%` }} className="h-full bg-[#FBBF24] transition-all duration-500" />
            <div style={{ width: `${lowPercent}%` }} className="h-full bg-[#F97316] transition-all duration-500" />
            <div style={{ width: `${outPercent}%` }} className="h-full bg-[#EF4444] transition-all duration-500" />
          </div>
        </div>

      </div>

      {/* 2. Unified Telemetry Metric Ribbon (High-density, no clutter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#1C1917] border border-[#38332E] rounded-2xl divide-y lg:divide-y-0 lg:divide-x divide-[#38332E] overflow-hidden">
        
        {/* Metric 1: Catalog SKUs */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className="p-4 hover:bg-[#292524]/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Catalog SKUs</span>
            <Boxes className="w-4 h-4 text-[#78716C] group-hover:text-[#F59E0B] transition-colors" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#FAFAF9] font-mono">{items.length}</span>
            <span className="text-[10px] text-[#A8A29E] font-mono">active items</span>
          </div>
          <p className="text-[10px] text-[#F59E0B] font-mono mt-1 flex items-center gap-1">
            <span>4 Departments</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Metric 2: Physical Units */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className="p-4 hover:bg-[#292524]/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Physical Units</span>
            <PackageCheck className="w-4 h-4 text-[#78716C] group-hover:text-[#FBBF24] transition-colors" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#FBBF24] font-mono">{totalUnits}</span>
            <span className="text-[10px] text-[#A8A29E] font-mono">total units</span>
          </div>
          <p className="text-[10px] text-[#A8A29E] font-mono mt-1">Shelves &amp; Backrooms</p>
        </div>

        {/* Metric 3: Restock Queue */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className="p-4 hover:bg-[#292524]/60 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Attention Needed</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-[#F97316] animate-pulse' : 'text-[#78716C]'}`} />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-[#F97316]' : 'text-[#FAFAF9]'}`}>
              {lowStockItems.length + outOfStockItems.length}
            </span>
            <span className="text-[10px] text-[#A8A29E] font-mono">items</span>
          </div>
          <p className="text-[10px] text-[#EF4444] font-mono mt-1 flex items-center gap-1">
            <span>{outOfStockItems.length} zero stock</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Metric 4: Valuation (Manager) vs Stock Entry (Staff) */}
        {isManager ? (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('FINANCIALS')}
            className="p-4 hover:bg-[#292524]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#A8A29E]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Retail Valuation</span>
              <DollarSign className="w-4 h-4 text-[#78716C] group-hover:text-[#FBBF24] transition-colors" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#FAFAF9] font-mono">
                Rs {analytics?.summary?.retailValue ? analytics.summary.retailValue.toLocaleString() : '0'}
              </span>
            </div>
            <p className="text-[10px] text-[#FBBF24] font-mono mt-1 flex items-center gap-1">
              <span>Gross Margin: {analytics?.summary?.grossMarginPercentage || '0'}%</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        ) : (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
            className="p-4 hover:bg-[#292524]/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#A8A29E]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Stock Entry</span>
              <ArrowDownToLine className="w-4 h-4 text-[#78716C] group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#F59E0B] font-mono">Fast Restock</span>
            </div>
            <p className="text-[10px] text-[#A8A29E] font-mono mt-1 flex items-center gap-1">
              <span>Receive or sell items</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        )}

      </div>

      {/* 3. Core Store Brain AI Terminal Command Strip */}
      <div className="bg-[#1C1917] border border-[#F97316]/40 rounded-2xl p-4 shadow-sm shadow-[#F97316]/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#292524] border border-[#F97316]/50 flex items-center justify-center relative shrink-0">
              <Bot className="w-4 h-4 text-[#FB923C]" />
              <span className="w-2 h-2 rounded-full bg-[#F97316] absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#FAFAF9]">Store Brain Terminal</h3>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#F97316]/20 text-[#FB923C] border border-[#F97316]/30">
                  AUTONOMOUS AGENT
                </span>
              </div>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                Query inventory counts, prepare stock confirmations, view bestseller trends, or discover categories.
              </p>
            </div>
          </div>

          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#FAFAF9] text-xs font-mono font-bold transition shadow-sm shadow-[#F97316]/20 shrink-0"
          >
            <span>Launch Brain</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompt seed buttons */}
        <div className="mt-3.5 pt-3 border-t border-[#38332E] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-[#78716C] uppercase shrink-0">Quick Queries:</span>
          
          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('What is the current stock of Type-C cables?')}
            className="px-2.5 py-1 rounded-lg bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F97316]/50 text-[11px] text-[#FAFAF9] font-mono transition whitespace-nowrap"
          >
            "What is the stock of Type-C cables?"
          </button>

          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('What categories do we have?')}
            className="px-2.5 py-1 rounded-lg bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F97316]/50 text-[11px] text-[#FAFAF9] font-mono transition whitespace-nowrap"
          >
            "What categories do we have?"
          </button>

          {isManager && (
            <button
              onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('Which item sold the most this week?')}
              className="px-2.5 py-1 rounded-lg bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F97316]/50 text-[11px] text-[#FAFAF9] font-mono transition whitespace-nowrap"
            >
              "Which item sold most this week?"
            </button>
          )}

          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('Add 40 Type-C cables from Ali Traders')}
            className="px-2.5 py-1 rounded-lg bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F97316]/50 text-[11px] text-[#FAFAF9] font-mono transition whitespace-nowrap"
          >
            "Add 40 Type-C cables from Ali Traders"
          </button>
        </div>
      </div>

      {/* 4. Two-Column Operational Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Live Stock Movement Ledger */}
        <div className="lg:col-span-7 bg-[#1C1917] border border-[#38332E] rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#38332E] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                Live Movement Ledger
              </h3>
            </div>
            <button 
              onClick={() => onNavigateTab && onNavigateTab('HISTORY')}
              className="text-[11px] font-mono text-[#F59E0B] hover:underline flex items-center gap-0.5"
            >
              Full Ledger <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-[#A8A29E] py-8 text-center italic font-mono">
                No movements recorded yet.
              </p>
            ) : (
              recentMovements.map(m => {
                const deltaNum = m.quantity_change;
                const isPositive = deltaNum > 0;
                
                // Color badge based on movement type (No blue, green, purple)
                let badgeStyle = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
                if (m.movement_type === 'RECEIVED') badgeStyle = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30';
                if (m.movement_type === 'DAMAGED') badgeStyle = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
                if (m.movement_type === 'CUSTOMER_RETURN') badgeStyle = 'bg-[#FB923C]/15 text-[#FB923C] border-[#FB923C]/30';

                return (
                  <div 
                    key={m.id} 
                    className="p-3 rounded-xl bg-[#0C0A09] border border-[#38332E] hover:border-[#F59E0B]/40 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#FAFAF9]">{m.item_name}</span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                          {m.movement_type}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#78716C] mt-0.5">
                        {m.source === 'AI_AGENT' ? '⚡ Store Brain' : '👤 Manual'} • {m.user_name || 'Staff'} {m.supplier_or_reason ? `• ${m.supplier_or_reason}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${isPositive ? 'text-[#FBBF24]' : 'text-[#EF4444]'}`}>
                        {isPositive ? `+${deltaNum}` : deltaNum}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Attention Queue & Top Movers */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Priority Attention List (Low Stock & Out of Stock) */}
          <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                  Replenishment Priority
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#F97316]">
                {lowStockItems.length + outOfStockItems.length} SKUs Alert
              </span>
            </div>

            <div className="space-y-2">
              {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <p className="text-xs text-[#FBBF24] py-4 text-center font-mono">
                  ✓ All store catalog items are healthy.
                </p>
              ) : (
                [...outOfStockItems, ...lowStockItems].slice(0, 3).map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#0C0A09] border border-[#38332E] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#FAFAF9]">{item.name}</h4>
                      <p className="text-[10px] font-mono text-[#78716C]">
                        {item.section} • Shelf: {item.front_display || 'Aisle'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black font-mono block ${item.total_stock <= 0 ? 'text-[#EF4444]' : 'text-[#F97316]'}`}>
                        {item.total_stock} left
                      </span>
                      <button
                        onClick={() => onTriggerAiPrompt && onTriggerAiPrompt(`Add 30 ${item.name} from Ali Traders`)}
                        className="text-[9px] font-mono text-[#F59E0B] hover:underline"
                      >
                        Restock via AI →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Velocity Movers (Manager) or Fast Operations (Staff) */}
          {isManager ? (
            <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FBBF24]" />
                  <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                    Top Selling Velocity
                  </h3>
                </div>
                <button 
                  onClick={() => onNavigateTab && onNavigateTab('FINANCIALS')}
                  className="text-[10px] font-mono text-[#FBBF24] hover:underline"
                >
                  Analytics →
                </button>
              </div>

              <div className="space-y-2">
                {topSellers.length === 0 ? (
                  <p className="text-xs text-[#A8A29E] py-4 text-center italic font-mono">
                    No sales recorded yet this week.
                  </p>
                ) : (
                  topSellers.slice(0, 3).map((seller, idx) => (
                    <div key={seller.id} className="p-2.5 rounded-xl bg-[#0C0A09] border border-[#38332E] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-[#78716C]">#{idx + 1}</span>
                          <h4 className="font-bold text-xs text-[#FAFAF9]">{seller.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[#78716C] ml-4">{seller.section}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-[#FBBF24] block">
                          {seller.unitsSold} units
                        </span>
                        <span className="text-[10px] font-mono text-[#A8A29E]">
                          Rs {seller.totalRevenue?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                    Quick Operations
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#A8A29E]">Manual Forms</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                  className="p-2.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#FBBF24]/40 text-left transition group"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#FBBF24] mb-1" />
                  <div className="font-bold text-xs text-[#FAFAF9] group-hover:text-[#FBBF24] transition-colors">
                    Receive
                  </div>
                  <p className="text-[9px] text-[#78716C] font-mono">Deliveries</p>
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                  className="p-2.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F59E0B]/40 text-left transition group"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5 text-[#F59E0B] mb-1" />
                  <div className="font-bold text-xs text-[#FAFAF9] group-hover:text-[#F59E0B] transition-colors">
                    Point of Sale
                  </div>
                  <p className="text-[9px] text-[#78716C] font-mono">Customer sale</p>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
