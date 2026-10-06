import React from 'react';
import { useAuth } from '../context/AuthContext';
import StorePulseIndicator, { getStorePulseStatus } from './StorePulseIndicator';
import { 
  Activity, 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  PackageCheck, 
  AlertOctagon, 
  ChevronRight, 
  Bot,
  Clock,
  RotateCcw,
  Sliders,
  Send,
  Warehouse
} from 'lucide-react';

export default function StorePulseOverview({ 
  items = [], 
  movements = [], 
  analytics = null, 
  onNavigateTab, 
  onTriggerAiPrompt 
}) {
  const { isManager, isStaff, user } = useAuth();

  // Compute Store Pulse status breakdown from real items
  const totalUnits = items.reduce((sum, item) => sum + (parseInt(item.total_stock, 10) || 0), 0);
  const lowStockItems = items.filter(item => item.total_stock <= item.low_stock_threshold && item.total_stock > 0);
  const outOfStockItems = items.filter(item => item.total_stock <= 0);
  const healthyItems = items.filter(item => item.total_stock > item.low_stock_threshold);

  const healthyPercent = items.length > 0 ? Math.round((healthyItems.length / items.length) * 100) : 100;
  const lowPercent = items.length > 0 ? Math.round((lowStockItems.length / items.length) * 100) : 0;
  const outPercent = items.length > 0 ? Math.round((outOfStockItems.length / items.length) * 100) : 0;

  const topSellers = analytics?.topSellers || [];
  const recentMovements = movements.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. Greeting & Store Pulse Status Headline */}
      <div className="bg-[#171A18] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden">
        
        {/* Subtle background ambient pulse ring */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#8FAF87]/5 pointer-events-none blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8FAF87] animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-[#8FAF87] uppercase font-bold">
                Store Pulse • Operational
              </span>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-[11px] text-[#A8A295] font-mono">
                {isManager ? 'General Manager Command' : 'Floor Staff Operations'}
              </span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F1EDE3] tracking-tight">
              {isManager ? `Welcome, ${user?.name || 'Manager'}` : `Welcome, ${user?.name || 'Staff Member'}`}
            </h1>
            
            <p className="text-xs text-[#A8A295] mt-1 max-w-2xl leading-relaxed">
              {isManager 
                ? 'Nowshera Shopping Mall inventory is synchronized live with PostgreSQL. Monitor real stock velocity, retail valuation, and store margin health.' 
                : 'Nowshera Shopping Mall active floor operations. Record goods received, verify shelf locations, and use Store Brain for live stock queries.'}
            </p>
          </div>

          {/* Store Pulse Status Pill Overview */}
          <div className="flex items-center gap-3 bg-[#0B0D0C] border border-white/[0.08] px-4 py-3 rounded-xl shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-[#A8A295] uppercase tracking-wider font-semibold font-mono">Store Health</p>
              <p className="text-sm font-extrabold text-[#F1EDE3] flex items-center justify-end gap-1.5 mt-0.5">
                <span className={outOfStockItems.length > 0 ? 'text-[#C65A4A]' : lowStockItems.length > 0 ? 'text-[#D6A85F]' : 'text-[#8FAF87]'}>
                  {outOfStockItems.length > 0 
                    ? `${outOfStockItems.length} Out of Stock` 
                    : lowStockItems.length > 0 
                      ? `${lowStockItems.length} Low Stock Alert` 
                      : 'All Items Healthy'}
                </span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-white/10 flex items-center justify-center">
              <Activity className={`w-4 h-4 ${outOfStockItems.length > 0 ? 'text-[#C65A4A]' : lowStockItems.length > 0 ? 'text-[#D6A85F]' : 'text-[#8FAF87]'}`} />
            </div>
          </div>
        </div>

        {/* Pulse Ratio Bar (Healthy vs Low vs Out) */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A295] mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF87]" />
              Healthy: {healthyItems.length} ({healthyPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F]" />
              Low Stock: {lowStockItems.length} ({lowPercent}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C65A4A]" />
              Out: {outOfStockItems.length} ({outPercent}%)
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#0B0D0C] rounded-full overflow-hidden flex gap-0.5">
            <div style={{ width: `${healthyPercent}%` }} className="h-full bg-[#8FAF87] transition-all duration-500" />
            <div style={{ width: `${lowPercent}%` }} className="h-full bg-[#D6A85F] transition-all duration-500" />
            <div style={{ width: `${outPercent}%` }} className="h-full bg-[#C65A4A] transition-all duration-500" />
          </div>
        </div>

      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Catalog Products */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className="bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A8A295] uppercase tracking-wider font-semibold">Catalog SKUs</span>
            <Boxes className="w-4 h-4 text-[#7C776C] group-hover:text-[#8FAF87] transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#F1EDE3] font-mono">{items.length}</span>
            <span className="text-[11px] text-[#A8A295]">active items</span>
          </div>
          <p className="text-[10px] text-[#8FAF87] font-mono mt-1 flex items-center gap-1">
            <span>4 Mall Departments</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Card 2: Total Units On Hand */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className="bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A8A295] uppercase tracking-wider font-semibold">Physical Units</span>
            <PackageCheck className="w-4 h-4 text-[#8FAF87]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#8FAF87] font-mono">{totalUnits}</span>
            <span className="text-[11px] text-[#A8A295]">total stock</span>
          </div>
          <p className="text-[10px] text-[#A8A295] font-mono mt-1">Shelves &amp; Back Store Rooms</p>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('CATALOG')}
          className={`bg-[#171A18] hover:bg-[#1E221F] border p-4 rounded-xl transition-all cursor-pointer group ${
            lowStockItems.length > 0 ? 'border-[#D6A85F]/35' : 'border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A8A295] uppercase tracking-wider font-semibold">Attention Needed</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-[#D6A85F] animate-pulse' : 'text-[#7C776C]'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${lowStockItems.length > 0 ? 'text-[#D6A85F]' : 'text-[#F1EDE3]'}`}>
              {lowStockItems.length + outOfStockItems.length}
            </span>
            <span className="text-[11px] text-[#A8A295]">items low/out</span>
          </div>
          <p className="text-[10px] text-[#D6A85F] font-mono mt-1 flex items-center gap-1">
            <span>{outOfStockItems.length} zero stock items</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Card 4: Financial Valuation (Manager) vs Stock Actions (Staff) */}
        {isManager ? (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('FINANCIALS')}
            className="bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#A8A295] uppercase tracking-wider font-semibold">Retail Valuation</span>
              <DollarSign className="w-4 h-4 text-[#8FAF87]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-[#F1EDE3] font-mono">
                Rs {analytics?.summary?.retailValue ? analytics.summary.retailValue.toLocaleString() : '0'}
              </span>
            </div>
            <p className="text-[10px] text-[#8FAF87] font-mono mt-1 flex items-center gap-1">
              <span>Gross Margin: {analytics?.summary?.grossMarginPercentage || '0'}%</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        ) : (
          <div 
            onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
            className="bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#A8A295] uppercase tracking-wider font-semibold">Stock Operations</span>
              <ArrowDownToLine className="w-4 h-4 text-[#8FAF87]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-[#8FAF87]">Fast Restock</span>
            </div>
            <p className="text-[10px] text-[#A8A295] font-mono mt-1 flex items-center gap-1">
              <span>Receive, Sell or Adjust items</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        )}

      </div>

      {/* 3. Prominent Store Brain AI Command Panel */}
      <div className="bg-[#171A18] border border-[#8FAF87]/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E221F] border border-[#8FAF87]/40 flex items-center justify-center relative shrink-0">
              <Bot className="w-5 h-5 text-[#8FAF87]" />
              <span className="w-2 h-2 rounded-full bg-[#8FAF87] absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#F1EDE3]">Store Brain Intelligence</h3>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#8FAF87]/15 text-[#8FAF87] border border-[#8FAF87]/30">
                  READY
                </span>
              </div>
              <p className="text-xs text-[#A8A295] mt-0.5">
                Natural-language stock queries, weekly bestseller analysis, and safe draft confirmations.
              </p>
            </div>
          </div>

          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8FAF87] hover:bg-[#A5C49E] text-[#0B0D0C] text-xs font-mono font-bold transition shadow-md shadow-[#8FAF87]/20 shrink-0"
          >
            <span>Open Assistant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick prompt seed buttons */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-[#7C776C] uppercase shrink-0">Suggested:</span>
          
          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('What is the current stock of Type-C cables?')}
            className="px-2.5 py-1 rounded-lg bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#8FAF87]/40 text-[11px] text-[#F1EDE3] transition whitespace-nowrap"
          >
            "What is the current stock of Type-C cables?"
          </button>

          {isManager && (
            <button
              onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('Which item sold the most this week?')}
              className="px-2.5 py-1 rounded-lg bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#8FAF87]/40 text-[11px] text-[#F1EDE3] transition whitespace-nowrap"
            >
              "Which item sold the most this week?"
            </button>
          )}

          <button
            onClick={() => onTriggerAiPrompt && onTriggerAiPrompt('Add 40 Type-C cables from Ali Traders')}
            className="px-2.5 py-1 rounded-lg bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#8FAF87]/40 text-[11px] text-[#F1EDE3] transition whitespace-nowrap"
          >
            "Add 40 Type-C cables from Ali Traders"
          </button>
        </div>
      </div>

      {/* 4. Two-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Top-Selling (Manager) or Shortcuts (Staff) */}
        {isManager ? (
          <div className="bg-[#171A18] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8FAF87]" />
                <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
                  Top-Selling Products This Week
                </h3>
              </div>
              <button 
                onClick={() => onNavigateTab && onNavigateTab('FINANCIALS')}
                className="text-[11px] font-mono text-[#8FAF87] hover:underline flex items-center gap-0.5"
              >
                Full Analytics <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {topSellers.length === 0 ? (
                <p className="text-xs text-[#A8A295] py-8 text-center italic">
                  No sales recorded yet this week.
                </p>
              ) : (
                topSellers.slice(0, 4).map((seller, idx) => (
                  <div key={seller.id} className="p-3 rounded-lg bg-[#0B0D0C] border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#7C776C]">#{idx + 1}</span>
                        <h4 className="font-bold text-xs text-[#F1EDE3]">{seller.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-[#A8A295] ml-4">{seller.section}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-[#8FAF87] block">
                        {seller.unitsSold} units
                      </span>
                      <span className="text-[10px] font-mono text-[#F1EDE3]">
                        Rs {seller.totalRevenue?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#171A18] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#8FAF87]" />
                <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
                  Stock Operation Shortcuts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#A8A295]">Physical Inventory Desk</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                className="p-3 rounded-xl bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#8FAF87]/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#8FAF87]/15 text-[#8FAF87] flex items-center justify-center mb-2">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-[#F1EDE3] group-hover:text-[#8FAF87] transition-colors">
                  Receive Stock
                </div>
                <p className="text-[10px] text-[#A8A295] mt-0.5 font-mono">Supplier shipments</p>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                className="p-3 rounded-xl bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#B8794A]/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#B8794A]/15 text-[#B8794A] flex items-center justify-center mb-2">
                  <ArrowUpFromLine className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-[#F1EDE3] group-hover:text-[#B8794A] transition-colors">
                  Point of Sale
                </div>
                <p className="text-[10px] text-[#A8A295] mt-0.5 font-mono">Record shopper sale</p>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                className="p-3 rounded-xl bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#C65A4A]/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#C65A4A]/15 text-[#C65A4A] flex items-center justify-center mb-2">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-[#F1EDE3] group-hover:text-[#C65A4A] transition-colors">
                  Damage Write-Off
                </div>
                <p className="text-[10px] text-[#A8A295] mt-0.5 font-mono">Damaged / defective</p>
              </button>

              <button
                onClick={() => onNavigateTab && onNavigateTab('MANUAL_FORMS')}
                className="p-3 rounded-xl bg-[#0B0D0C] hover:bg-[#1E221F] border border-white/10 hover:border-[#D6A85F]/40 text-left transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#D6A85F]/15 text-[#D6A85F] flex items-center justify-center mb-2">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-[#F1EDE3] group-hover:text-[#D6A85F] transition-colors">
                  Count Adjustment
                </div>
                <p className="text-[10px] text-[#A8A295] mt-0.5 font-mono">Audit corrections</p>
              </button>
            </div>
          </div>
        )}

        {/* Right Column: Recent Stock Movements Feed */}
        <div className="bg-[#171A18] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8FAF87]" />
              <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
                Recent Stock Movements
              </h3>
            </div>
            <button 
              onClick={() => onNavigateTab && onNavigateTab('HISTORY')}
              className="text-[11px] font-mono text-[#8FAF87] hover:underline flex items-center gap-0.5"
            >
              Full Ledger <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-[#A8A295] py-8 text-center italic">
                No movements recorded yet.
              </p>
            ) : (
              recentMovements.map(m => {
                const deltaNum = m.quantity_change;
                const isPositive = deltaNum > 0;
                return (
                  <div key={m.id} className="p-3 rounded-lg bg-[#0B0D0C] border border-white/[0.05] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F1EDE3]">{m.item_name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-[#A8A295]">
                          {m.movement_type}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#7C776C] mt-0.5">
                        {m.source === 'AI_AGENT' ? '⚡ Store Brain AI' : '👤 Manual Entry'} • {m.user_name || 'Staff'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${isPositive ? 'text-[#8FAF87]' : 'text-[#C65A4A]'}`}>
                        {isPositive ? `+${deltaNum}` : deltaNum}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
