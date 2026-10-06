import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  KeyRound,
  Info
} from 'lucide-react';

export default function SignInModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0C0A09]/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#1C1917] border border-[#38332E] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header accent strip - Obsidian Gold & Ember */}
        <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#EF4444]" />

        <div className="p-6">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0C0A09] border border-[#38332E] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#FAFAF9] tracking-tight">
                  Sign In to StockSense
                </h3>
                <p className="text-[11px] font-mono text-[#A8A29E]">
                  Nowshera Shopping Mall Terminal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A29E] mb-1.5 font-semibold">
                Mall Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nowshera.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] placeholder-[#78716C] focus:outline-none focus:border-[#F59E0B]/70 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A29E] mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] placeholder-[#78716C] focus:outline-none focus:border-[#F59E0B]/70 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0C0A09] font-mono font-bold text-xs tracking-wider transition-all duration-200 shadow-md shadow-[#F59E0B]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0C0A09] border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In &amp; Launch Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper for Demonstration Testing */}
          <div className="mt-5 pt-4 border-t border-[#38332E] space-y-2.5">
            <p className="text-[10px] font-mono uppercase text-[#78716C] tracking-wider text-center">
              Verified Mall Accounts (One-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('manager@nowshera.com', 'manager123')}
                className="p-2.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#F59E0B]/50 text-left transition flex items-center gap-2 group"
              >
                <ShieldCheck className="w-4 h-4 text-[#F59E0B] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[11px] font-bold text-[#FAFAF9]">Bilal Khan</div>
                  <div className="text-[9px] font-mono text-[#A8A29E]">Store Manager</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff@nowshera.com', 'staff123')}
                className="p-2.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] border border-[#38332E] hover:border-[#FBBF24]/50 text-left transition flex items-center gap-2 group"
              >
                <UserCheck className="w-4 h-4 text-[#FBBF24] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[11px] font-bold text-[#FAFAF9]">Tariq Mehmood</div>
                  <div className="text-[9px] font-mono text-[#A8A29E]">Floor Staff</div>
                </div>
              </button>
            </div>
            <p className="text-[9px] text-[#78716C] text-center italic mt-1 font-mono">
              Backend verifies credentials and issues role-restricted JWT token.
            </p>
          </div>

          {/* Notice on Account Creation */}
          <div className="mt-4 p-2.5 rounded-lg bg-[#0C0A09] border border-[#38332E] flex items-start gap-2 text-[10px] text-[#A8A29E]">
            <Info className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
            <p>
              New store accounts are provisioned by mall administration to protect confidential pricing and margin controls.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
