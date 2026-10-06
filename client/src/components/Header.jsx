import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Bot, 
  ShoppingBag, 
  Zap, 
  Shirt, 
  UtensilsCrossed, 
  LayoutGrid,
  Activity,
  LogOut
} from 'lucide-react';

export default function Header({ 
  selectedSection, 
  setSelectedSection, 
  onToggleAiDrawer, 
  isAiDrawerOpen 
}) {
  const { user, isManager, logout } = useAuth();

  const sections = [
    { id: 'All', label: 'All Store', icon: LayoutGrid },
    { id: 'Grocery', label: 'Grocery', icon: ShoppingBag },
    { id: 'Clothing', label: 'Clothing', icon: Shirt },
    { id: 'Electronics', label: 'Electronics', icon: Zap },
    { id: 'Household', label: 'Household', icon: UtensilsCrossed },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0C0A09]/95 backdrop-blur-md border-b border-[#38332E] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Terminal Live Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1917] border border-[#38332E] flex items-center justify-center relative group shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] absolute -top-0.5 -right-0.5 animate-pulse" />
              <Activity className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#FAFAF9]">
                  StockSense
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                  TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-[#A8A29E] font-medium flex items-center gap-1.5 font-mono">
                <span>Nowshera Shopping Mall</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#A8A29E]/30" />
                <span className="text-[#FBBF24]">Live DB Sync</span>
              </p>
            </div>
          </div>

          {/* Mobile AI launcher */}
          <button 
            onClick={onToggleAiDrawer}
            className={`md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono transition-all ${
              isAiDrawerOpen
                ? 'bg-[#F97316] text-[#FAFAF9] border-[#F97316]'
                : 'bg-[#1C1917] border-[#F97316]/40 text-[#FB923C]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#FB923C]" />
            <span>Store Brain</span>
          </button>
        </div>

        {/* Department Quick Filter Control */}
        <div className="flex items-center gap-1 bg-[#1C1917]/80 p-1 rounded-xl border border-[#38332E] overflow-x-auto max-w-full no-scrollbar">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-[#292524] text-[#FAFAF9] border border-[#F59E0B]/40 shadow-sm' 
                    : 'text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#292524]/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Identity, Role Indicator & Core Store Brain Launcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Authenticated User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1917] border border-[#38332E] text-xs">
            {isManager ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#FBBF24]" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-[#A8A29E]" />
            )}
            
            <div className="flex flex-col">
              <span className="font-bold text-[#FAFAF9] leading-none text-[11px]">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[9px] font-mono text-[#A8A29E] leading-none mt-0.5">
                {isManager ? 'General Manager' : 'Store Staff'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out of Terminal"
              className="ml-1 p-1 rounded-md text-[#78716C] hover:text-[#EF4444] hover:bg-white/5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop "Store Brain" Core Feature Launcher */}
          <button
            onClick={onToggleAiDrawer}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
              isAiDrawerOpen 
                ? 'bg-[#F97316] text-[#FAFAF9] border-[#F97316] shadow-md shadow-[#F97316]/30' 
                : 'bg-[#1C1917] text-[#FB923C] hover:text-[#FAFAF9] hover:border-[#F97316]/60 hover:bg-[#292524] border-[#F97316]/35 shadow-sm'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${isAiDrawerOpen ? 'text-[#FAFAF9]' : 'text-[#FB923C]'}`} />
            <span>Store Brain</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB923C] animate-pulse" />
          </button>
        </div>

      </div>
    </header>
  );
}
