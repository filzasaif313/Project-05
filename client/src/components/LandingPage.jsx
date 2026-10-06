import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  ArrowDownToLine, 
  Layers, 
  Activity, 
  Check, 
  Building2,
  Sparkles,
  Lock,
  ChevronRight,
  TrendingUp,
  Warehouse,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import StorePulseIndicator from './StorePulseIndicator';

export default function LandingPage({ onOpenSignIn }) {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      step: '01',
      title: 'RECEIVE',
      metric: '+40 units',
      caption: 'Supplier delivery arrives at mall loading dock',
      color: 'text-[#8FAF87]',
      border: 'border-[#8FAF87]/30',
      bg: 'bg-[#8FAF87]/10'
    },
    {
      step: '02',
      title: 'TRACK',
      metric: '15 → 55',
      caption: 'Stock ledger updates instantly across shelf & backroom',
      color: 'text-[#B8794A]',
      border: 'border-[#B8794A]/30',
      bg: 'bg-[#B8794A]/10'
    },
    {
      step: '03',
      title: 'DECIDE',
      metric: 'Healthy / Low / Out',
      caption: 'Automated Store Pulse signals replenishment needs',
      color: 'text-[#D6A85F]',
      border: 'border-[#D6A85F]/30',
      bg: 'bg-[#D6A85F]/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#F1EDE3] flex flex-col selection:bg-[#8FAF87] selection:text-[#0B0D0C] overflow-hidden">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B0D0C]/90 backdrop-blur-md border-b border-white/[0.07] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171A18] border border-white/10 flex items-center justify-center shadow-inner relative">
              <span className="w-2 h-2 rounded-full bg-[#8FAF87] absolute -top-0.5 -right-0.5 animate-pulse" />
              <Activity className="w-4 h-4 text-[#8FAF87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#F1EDE3]">
                  StockSense
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-widest rounded bg-[#8FAF87]/15 text-[#8FAF87] border border-[#8FAF87]/30 uppercase">
                  Terminal
                </span>
              </div>
              <p className="text-[10px] text-[#A8A295] font-mono">
                Nowshera Shopping Mall
              </p>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171A18] hover:bg-[#1E221F] border border-white/10 hover:border-[#8FAF87]/40 text-[#F1EDE3] text-xs font-mono font-bold transition shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-[#8FAF87]" />
              <span>Sign In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero: "After-Hours Stockroom" */}
      <section className="relative px-6 lg:px-12 pt-12 pb-20 border-b border-white/[0.06]">
        
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8FAF87]/5 pointer-events-none blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#B8794A]/5 pointer-events-none blur-3xl" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A18] border border-white/10 text-[11px] font-mono text-[#A8A295]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF87] animate-pulse" />
              <span>After-Hours Retail Intelligence</span>
              <span className="text-white/20">•</span>
              <span className="text-[#8FAF87] font-semibold">PostgreSQL Synchronized</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F1EDE3] tracking-tight leading-[1.08]">
              Know what’s on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F1EDE3] via-[#DCD7CB] to-[#8FAF87]">
                your shelves.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A8A295] max-w-xl font-normal leading-relaxed">
              Real-time inventory intelligence for Nowshera Shopping Mall. Dual shelf and backroom localization, zero-floor verification, and conversational AI stock control.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSignIn}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#8FAF87] hover:bg-[#A5C49E] text-[#0B0D0C] font-mono font-bold text-xs tracking-wider transition-all duration-200 shadow-lg shadow-[#8FAF87]/20 group"
              >
                <span>Launch Store Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenSignIn}
                className="px-5 py-3.5 rounded-xl bg-[#171A18] hover:bg-[#1E221F] border border-white/10 hover:border-white/20 text-[#F1EDE3] font-mono text-xs font-semibold transition"
              >
                Sign In With Mall Credentials
              </button>
            </div>

            {/* Quick spec pills */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-[#7C776C] block text-[10px] uppercase font-semibold">Database</span>
                <span className="font-bold text-[#F1EDE3]">PostgreSQL Real</span>
              </div>
              <div>
                <span className="text-[#7C776C] block text-[10px] uppercase font-semibold">Role Security</span>
                <span className="font-bold text-[#8FAF87]">Manager vs Staff</span>
              </div>
              <div>
                <span className="text-[#7C776C] block text-[10px] uppercase font-semibold">AI Assistant</span>
                <span className="font-bold text-[#B8794A]">Store Brain</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Isometric 3D Retail Stockroom Illustration */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-[#171A18] shadow-2xl group transition-all duration-300">
              
              {/* Image asset */}
              <img 
                src="/images/after_hours_stockroom.jpg" 
                alt="StockSense After-Hours Retail Stockroom"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                loading="eager"
              />

              {/* Floating Inventory Data Overlay Badges */}
              
              {/* Badge 1: Low-Stock Shelf Indicator (Amber) */}
              <div className="absolute top-6 left-6 p-2.5 rounded-xl bg-[#171A18]/90 backdrop-blur-md border border-[#D6A85F]/40 shadow-xl flex items-center gap-2.5 animate-pulse-subtle">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D6A85F] animate-ping" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#D6A85F] block uppercase tracking-wider">
                    Shelf 3B • Low Stock
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#F1EDE3]">
                    QTY: 04 Units Left
                  </span>
                </div>
              </div>

              {/* Badge 2: Healthy Stock Indicator (Sage) */}
              <div className="absolute bottom-6 right-6 p-2.5 rounded-xl bg-[#171A18]/90 backdrop-blur-md border border-[#8FAF87]/40 shadow-xl flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#8FAF87]" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#8FAF87] block uppercase tracking-wider">
                    Rack 2A • Moving Fast
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#F1EDE3]">
                    QTY: 55 Units Synced
                  </span>
                </div>
              </div>

              {/* Badge 3: Scan Tag (Copper) */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden sm:flex items-center gap-2 p-2 rounded-lg bg-[#0B0D0C]/85 border border-[#B8794A]/40 text-[10px] font-mono text-[#DCD7CB]">
                <QrCode className="w-3.5 h-3.5 text-[#B8794A]" />
                <span>SKU-NOW-8812</span>
              </div>

            </div>

            {/* Visual description caption */}
            <p className="text-[11px] font-mono text-[#7C776C] text-center mt-3">
              Nowshera Mall Central Stockroom • Digital Twin View
            </p>
          </div>

        </div>

      </section>

      {/* Section 2: "From shelf → system." */}
      <section className="px-6 lg:px-12 py-20 border-b border-white/[0.06] bg-[#0E100F]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono tracking-widest text-[#8FAF87] uppercase font-bold">
              Continuous Ledger Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1EDE3] tracking-tight">
              From shelf → system.
            </h2>
            <p className="text-sm text-[#A8A295]">
              Every physical carton, sale, and customer return commits cleanly to PostgreSQL with zero discrepancies.
            </p>
          </div>

          {/* 3 Connected Stages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {stages.map((stage, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-2xl bg-[#171A18] border ${stage.border} relative group hover:-translate-y-1 transition-all duration-300 shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#7C776C]">{stage.step}</span>
                  <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded ${stage.bg} ${stage.color}`}>
                    STAGE {stage.step}
                  </span>
                </div>

                <h3 className="text-lg font-mono font-black text-[#F1EDE3] tracking-wide">
                  {stage.title}
                </h3>

                <div className="my-3">
                  <span className={`text-2xl font-mono font-extrabold ${stage.color}`}>
                    {stage.metric}
                  </span>
                </div>

                <p className="text-xs text-[#A8A295] leading-relaxed">
                  {stage.caption}
                </p>

                {/* Arrow connector for desktop */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1E221F] border border-white/10 items-center justify-center z-10 text-[#A8A295]">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* Section 3: Concise Product Overview (4 Core Pillars) */}
      <section className="px-6 lg:px-12 py-20 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="space-y-2">
            <span className="text-[11px] font-mono tracking-widest text-[#B8794A] uppercase font-bold">
              Architecture &amp; Features
            </span>
            <h2 className="text-3xl font-extrabold text-[#F1EDE3] tracking-tight">
              Engineered for real store operations.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Pillar 1: Real Inventory */}
            <div className="p-5 rounded-2xl bg-[#171A18] border border-white/[0.08] hover:border-[#8FAF87]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-[#8FAF87]/30 flex items-center justify-center text-[#8FAF87]">
                <Warehouse className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#F1EDE3]">Real Inventory</h4>
              <p className="text-xs text-[#A8A295] leading-relaxed">
                Directly synchronized with PostgreSQL. Tracks Front Display shelves and Back Store Room locations without mock data.
              </p>
            </div>

            {/* Pillar 2: Smart Stock Operations */}
            <div className="p-5 rounded-2xl bg-[#171A18] border border-white/[0.08] hover:border-[#B8794A]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-[#B8794A]/30 flex items-center justify-center text-[#B8794A]">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#F1EDE3]">Smart Operations</h4>
              <p className="text-xs text-[#A8A295] leading-relaxed">
                Receive, Sell, Damage write-off, and Count Adjustments. Live mathematical preview protects the zero-floor stock invariant.
              </p>
            </div>

            {/* Pillar 3: Store Brain */}
            <div className="p-5 rounded-2xl bg-[#171A18] border border-white/[0.08] hover:border-[#D6A85F]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-[#D6A85F]/30 flex items-center justify-center text-[#D6A85F]">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#F1EDE3]">Store Brain AI</h4>
              <p className="text-xs text-[#A8A295] leading-relaxed">
                Conversational inventory querying and draft preview confirmations with 10-minute expiry. Never mutates stock unconfirmed.
              </p>
            </div>

            {/* Pillar 4: Controlled Access */}
            <div className="p-5 rounded-2xl bg-[#171A18] border border-white/[0.08] hover:border-[#C65A4A]/40 transition space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-[#C65A4A]/30 flex items-center justify-center text-[#C65A4A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-mono font-bold text-sm text-[#F1EDE3]">Controlled Access</h4>
              <p className="text-xs text-[#A8A295] leading-relaxed">
                Strict Manager vs Staff role boundaries. Wholesale costs and gross margins remain cryptographically protected from staff.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 lg:px-12 bg-[#0B0D0C] border-t border-white/[0.06] text-xs font-mono text-[#7C776C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 StockSense • Nowshera Shopping Mall Terminal System</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#8FAF87]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF87]" />
              PostgreSQL Connected
            </span>
            <span className="text-white/20">•</span>
            <button 
              onClick={onOpenSignIn}
              className="text-[#F1EDE3] hover:text-[#8FAF87] transition font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
