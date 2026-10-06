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
  LogOut,
  User
} from 'lucide-react';

export default function Header({ 
  selectedSection, 
  setSelectedSection, 
  onToggleAiDrawer, 
  isAiDrawerOpen 
}) {
  const { user, isManager, isStaff, logout } = useAuth();

  const sections = [
    { id: 'All', label: 'All Store', icon: LayoutGrid },
    { id: 'Grocery', label: 'Grocery', icon: ShoppingBag },
    { id: 'Clothing', label: 'Clothing', icon: Shirt },
    { id: 'Electronics', label: 'Electronics', icon: Zap },
    { id: 'Household', label: 'Household', icon: UtensilsCrossed },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D0C]/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Mall Live Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#171A18] border border-white/10 flex items-center justify-center shadow-inner relative group">
              <span className="w-2 h-2 rounded-full bg-[#8FAF87] absolute -top-0.5 -right-0.5 animate-pulse" />
              <Activity className="w-4 h-4 text-[#8FAF87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#F1EDE3]">
                  StockSense
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider rounded bg-[#8FAF87]/15 text-[#8FAF87] border border-[#8FAF87]/30 uppercase">
                  STORE PULSE
                </span>
              </div>
              <p className="text-[11px] text-[#A8A295] font-medium flex items-center gap-1.5 font-mono">
                <span>Nowshera Shopping Mall</span>
                <span className="inline-block w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[#8FAF87]">PostgreSQL DB</span>
              </p>
            </div>
          </div>

          {/* Mobile AI button */}
          <button 
            onClick={onToggleAiDrawer}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171A18] border border-[#8FAF87]/30 text-[#8FAF87] text-xs font-semibold"
          >
            <Bot className="w-3.5 h-3.5 text-[#8FAF87]" />
            <span>Store Brain</span>
          </button>
        </div>

        {/* Department Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isSelected 
                    ? 'bg-[#1E221F] text-[#F1EDE3] border border-[#8FAF87]/40 shadow-sm shadow-black/40' 
                    : 'bg-[#171A18]/60 text-[#A8A295] hover:text-[#F1EDE3] hover:bg-[#171A18] border border-white/[0.05]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8FAF87]' : 'text-[#7C776C]'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Identity, Role Indicator & AI Launcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Authenticated User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171A18] border border-white/10 text-xs">
            {isManager ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF87]" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-[#D6A85F]" />
            )}
            
            <div className="flex flex-col">
              <span className="font-bold text-[#F1EDE3] leading-none text-[11px]">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[9px] font-mono text-[#A8A295] leading-none mt-0.5">
                {isManager ? 'General Manager' : 'Store Staff'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out of Terminal"
              className="ml-1 p-1 rounded-md text-[#7C776C] hover:text-[#C65A4A] hover:bg-white/5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop "Store Brain" AI Button */}
          <button
            onClick={onToggleAiDrawer}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
              isAiDrawerOpen 
                ? 'bg-[#8FAF87] text-[#0B0D0C] border-[#8FAF87] font-bold shadow-md shadow-[#8FAF87]/20' 
                : 'bg-[#171A18] text-[#F1EDE3] hover:border-[#8FAF87]/40 hover:bg-[#1E221F] border-white/10'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${isAiDrawerOpen ? 'text-[#0B0D0C]' : 'text-[#8FAF87]'}`} />
            <span>Store Brain</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF87] animate-pulse" />
          </button>
        </div>

      </div>
    </header>
  );
}
