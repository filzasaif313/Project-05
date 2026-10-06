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
  Building2,
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
        className="absolute inset-0 bg-[#0B0D0C]/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#171A18] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#B8794A] via-[#8FAF87] to-[#D6A85F]" />

        <div className="p-6">
          {/* Top Bar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E221F] border border-white/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#8FAF87]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#F1EDE3] tracking-tight">
                  Sign In to StockSense
                </h3>
                <p className="text-[11px] font-mono text-[#A8A295]">
                  Nowshera Shopping Mall Terminal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A8A295] hover:text-[#F1EDE3] hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-[#C65A4A]/15 border border-[#C65A4A]/40 text-[#C65A4A] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A295] mb-1.5 font-semibold">
                Mall Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C776C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nowshera.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B0D0C] border border-white/10 rounded-xl text-xs text-[#F1EDE3] placeholder-[#7C776C] focus:outline-none focus:border-[#8FAF87]/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A8A295] mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7C776C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#0B0D0C] border border-white/10 rounded-xl text-xs text-[#F1EDE3] placeholder-[#7C776C] focus:outline-none focus:border-[#8FAF87]/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#8FAF87] hover:bg-[#A5C49E] text-[#0B0D0C] font-mono font-bold text-xs tracking-wider transition-all duration-200 shadow-md shadow-[#8FAF87]/15 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0B0D0C] border-t-transparent rounded-full animate-spin" />
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
          <div className="mt-5 pt-4 border-t border-white/[0.07] space-y-2.5">
            <p className="text-[10px] font-mono uppercase text-[#7C776C] tracking-wider text-center">
              Verified Mall Accounts (One-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('manager@nowshera.com', 'manager123')}
                className="p-2 rounded-lg bg-[#1E221F] hover:bg-[#282D2A] border border-white/10 text-left transition flex items-center gap-2 group"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF87] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[11px] font-bold text-[#F1EDE3]">Bilal Khan</div>
                  <div className="text-[9px] font-mono text-[#A8A295]">Store Manager</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff@nowshera.com', 'staff123')}
                className="p-2 rounded-lg bg-[#1E221F] hover:bg-[#282D2A] border border-white/10 text-left transition flex items-center gap-2 group"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D6A85F] group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[11px] font-bold text-[#F1EDE3]">Tariq Mehmood</div>
                  <div className="text-[9px] font-mono text-[#A8A295]">Floor Staff</div>
                </div>
              </button>
            </div>
            <p className="text-[9px] text-[#7C776C] text-center italic mt-1">
              Backend verifies credentials and issues role-restricted JWT token.
            </p>
          </div>

          {/* Notice on Account Creation */}
          <div className="mt-4 p-2.5 rounded-lg bg-[#0B0D0C] border border-white/[0.05] flex items-start gap-2 text-[10px] text-[#A8A295]">
            <Info className="w-3.5 h-3.5 text-[#B8794A] shrink-0 mt-0.5" />
            <p>
              New store accounts are provisioned by mall administration to protect confidential pricing and margin controls.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
