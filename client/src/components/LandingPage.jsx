import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  ArrowDownToLine, 
  Activity, 
  Lock, 
  ChevronRight, 
  Warehouse, 
  QrCode
} from 'lucide-react';

export default function LandingPage({ onOpenSignIn }) {

  const stages = [
    {
      step: '01',
      title: 'RECEIVE',
      metric: '+40 units',
      caption: 'Supplier delivery arrives at mall loading dock',
      color: 'text-[#FBBF24]',
      border: 'border-[#FBBF24]/30',
      bg: 'bg-[#FBBF24]/10'
    },
    {
      step: '02',
      title: 'TRACK',
      metric: '15 → 55',
      caption: 'Stock ledger updates instantly across shelf & backroom',
      color: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]/30',
      bg: 'bg-[#F59E0B]/10'
    },
    {
      step: '03',
      title: 'DECIDE',
      metric: 'Store Pulse Telemetry',
      caption: 'Automated telemetry signals replenishment needs and velocity',
      color: 'text-[#FB923C]',
      border: 'border-[#F97316]/30',
      bg: 'bg-[#F97316]/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] flex flex-col selection:bg-[#F59E0B] selection:text-[#0C0A09] overflow-hidden">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0C0A09]/90 backdrop-blur-md border-b border-[#38332E] px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1917] border border-[#38332E] flex items-center justify-center shadow-inner relative">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24] absolute -top-0.5 -right-0.5 animate-pulse" />
              <Activity className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#FAFAF9]">
                  StockSense
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-widest rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                  Terminal
                </span>
              </div>
              <p className="text-[10px] text-[#A8A29E] font-mono">
                Nowshera Shopping Mall
              </p>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] border border-[#38332E] hover:border-[#F59E0B]/50 text-[#FAFAF9] text-xs font-mono font-bold transition shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Sign In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero: "After-Hours Stockroom" */}
      <section className="relative px-6 lg:px-12 pt-12 pb-20 border-b border-[#38332E]">
        
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F59E0B]/5 pointer-events-none blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#F97316]/5 pointer-events-none blur-3xl" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1917] border border-[#38332E] text-[11px] font-mono text-[#A8A29E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
              <span>Retail Command Terminal</span>
              <span className="text-white/20">•</span>
              <span className="text-[#F59E0B] font-semibold">PostgreSQL Synchronized</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#FAFAF9] tracking-tight leading-[1.08]">
              Know what’s on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAFAF9] via-[#FBBF24] to-[#F59E0B]">
                your shelves.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A8A29E] max-w-xl font-normal leading-relaxed">
              Real-time inventory intelligence for Nowshera Shopping Mall. Dual shelf and backroom localization, zero-floor verification, and conversational Store Brain intelligence.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0C0A09] font-mono font-bold text-xs tracking-wider transition-all duration-200 shadow-lg shadow-[#F59E0B]/25 group"
              >
                <span>Launch Store Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenSignIn}
                className="px-5 py-3.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] border border-[#38332E] hover:border-[#F59E0B]/40 text-[#FAFAF9] font-mono text-xs font-semibold transition"
              >
                Sign In With Mall Credentials
              </button>
            </div>

            {/* Quick spec pills */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#38332E] text-xs font-mono">
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Database</span>
                <span className="font-bold text-[#FAFAF9]">PostgreSQL Live</span>
              </div>
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-semibold">Role Security</span>
                <span className="font-bold text-[#FBBF24]">Manager vs Staff</span>
              </div>
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-semibold">AI Intelligence</span>
                <span className="font-bold text-[#FB923C]">Store Brain</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Isometric 3D Retail Stockroom Illustration */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#38332E] bg-[#1C1917] shadow-2xl group transition-all duration-300">
              
              {/* Image asset */}
              <img 
                src="/images/after_hours_stockroom.jpg" 
                alt="StockSense After-Hours Retail Stockroom"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                loading="eager"
              />

              {/* Floating Inventory Data Overlay Badges */}
              
              {/* Badge 1: Low-Stock Shelf Indicator (Crimson Red) */}
              <div className="absolute top-6 left-6 p-2.5 rounded-xl bg-[#1C1917]/90 backdrop-blur-md border border-[#EF4444]/40 shadow-xl flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#EF4444] block uppercase tracking-wider">
                    Shelf 3B • Low Stock
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#FAFAF9]">
                    QTY: 04 Units Left
                  </span>
                </div>
              </div>

              {/* Badge 2: Healthy Stock Indicator (Sun Gold) */}
              <div className="absolute bottom-6 right-6 p-2.5 rounded-xl bg-[#1C1917]/90 backdrop-blur-md border border-[#FBBF24]/40 shadow-xl flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FBBF24] block uppercase tracking-wider">
                    Rack 2A • Moving Fast
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#FAFAF9]">
                    QTY: 55 Units Synced
                  </span>
                </div>
              </div>

              {/* Badge 3: Scan Tag (Amber Gold) */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden sm:flex items-center gap-2 p-2 rounded-lg bg-[#0C0A09]/90 border border-[#F59E0B]/40 text-[10px] font-mono text-[#A8A29E]">
                <QrCode className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[#FAFAF9]">SKU-NOW-8812</span>
              </div>

            </div>

            {/* Visual description caption */}
            <p className="text-[11px] font-mono text-[#78716C] text-center mt-3">
              Nowshera Mall Central Stockroom • Digital Twin View
            </p>
          </div>

        </div>

      </section>

      {/* Section 2: "From shelf → system." */}
      <section className="px-6 lg:px-12 py-20 border-b border-[#38332E] bg-[#141210]/60">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono tracking-widest text-[#F59E0B] uppercase font-bold">
              Continuous Ledger Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FAFAF9] tracking-tight">
              From shelf → system.
            </h2>
            <p className="text-sm text-[#A8A29E]">
              Every physical carton, sale, and customer return commits cleanly to PostgreSQL with zero discrepancies.
            </p>
          </div>

          {/* 3 Connected Stages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {stages.map((stage, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-2xl bg-[#1C1917] border ${stage.border} relative group hover:-translate-y-1 transition-all duration-300 shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#78716C]">{stage.step}</span>
                  <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded ${stage.bg} ${stage.color}`}>
                    STAGE {stage.step}
                  </span>
                </div>

                <h3 className="text-lg font-mono font-black text-[#FAFAF9] tracking-wide">
                  {stage.title}
                </h3>

                <div className="my-3">
                  <span className={`text-2xl font-mono font-extrabold ${stage.color}`}>
                    {stage.metric}
                  </span>
                </div>

                <p className="text-xs text-[#A8A29E] leading-relaxed">
                  {stage.caption}
                </p>

                {/* Arrow connector for desktop */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#292524] border border-[#38332E] items-center justify-center z-10 text-[#A8A29E]">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* Section 3: Concise Product Overview (4 Core Pillars) */}
      <section className="px-6 lg:px-12 py-20 border-b border-[#38332E]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-[#F59E0B] uppercase font-bold">
              Architecture &amp; Features
            </span>
            <h2 className="text-3xl font-extrabold text-[#FAFAF9] tracking-tight">
              Engineered for real store operations.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Pillar 1: Real Inventory */}
            <div className="p-5 rounded-2xl bg-[#1C1917] border border-[#38332E] hover:border-[#F59E0B]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#0C0A09] border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <Warehouse className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#FAFAF9]">Real Inventory</h4>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Directly synchronized with PostgreSQL. Tracks Front Display shelves and Back Store Room locations without mock data.
              </p>
            </div>

            {/* Pillar 2: Smart Stock Operations */}
            <div className="p-5 rounded-2xl bg-[#1C1917] border border-[#38332E] hover:border-[#FBBF24]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#0C0A09] border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24]">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#FAFAF9]">Smart Operations</h4>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Receive, Sell, Damage write-off, and Count Adjustments. Live mathematical preview protects the zero-floor stock invariant.
              </p>
            </div>

            {/* Pillar 3: Store Brain */}
            <div className="p-5 rounded-2xl bg-[#1C1917] border border-[#38332E] hover:border-[#F97316]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#0C0A09] border border-[#F97316]/30 flex items-center justify-center text-[#FB923C]">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#FAFAF9]">Store Brain AI</h4>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Conversational inventory querying and draft preview confirmations with 10-minute expiry. Never mutates stock unconfirmed.
              </p>
            </div>

            {/* Pillar 4: Controlled Access */}
            <div className="p-5 rounded-2xl bg-[#1C1917] border border-[#38332E] hover:border-[#EF4444]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#0C0A09] border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#FAFAF9]">Controlled Access</h4>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                Strict Manager vs Staff role boundaries. Wholesale costs and gross margins remain cryptographically protected from staff.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 bg-[#0C0A09] border-t border-[#38332E] text-xs font-mono text-[#78716C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 StockSense • Nowshera Shopping Mall Terminal System</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#FBBF24]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              PostgreSQL Connected
            </span>
            <span className="text-white/20">•</span>
            <button 
              onClick={onOpenSignIn}
              className="text-[#FAFAF9] hover:text-[#F59E0B] transition font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
