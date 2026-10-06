import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Sparkles, 
  Keyboard, 
  AlertCircle, 
  RotateCcw, 
  SlidersHorizontal,
  RefreshCw,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

export default function HistoryView({ refreshTrigger }) {
  const { isManager } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await api.getMovements();
      setMovements(data.movements || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [refreshTrigger]);

  const filtered = movements.filter(m => {
    if (typeFilter === 'ALL') return true;
    return m.movement_type === typeFilter;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8FAF87]/15 text-[#8FAF87] border border-[#8FAF87]/30">
            <ArrowDownToLine className="w-3 h-3" />
            <span>RECEIVED</span>
          </span>
        );
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B8794A]/15 text-[#B8794A] border border-[#B8794A]/30">
            <ArrowUpFromLine className="w-3 h-3" />
            <span>SOLD</span>
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C65A4A]/15 text-[#C65A4A] border border-[#C65A4A]/30">
            <AlertCircle className="w-3 h-3" />
            <span>DAMAGED</span>
          </span>
        );
      case 'CUSTOMER_RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D6A85F]/15 text-[#D6A85F] border border-[#D6A85F]/30">
            <RotateCcw className="w-3 h-3" />
            <span>RETURN</span>
          </span>
        );
      case 'CORRECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8FAF87]/15 text-[#DCD7CB] border border-white/10">
            <SlidersHorizontal className="w-3 h-3" />
            <span>ADJUSTMENT</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Filter Control Bar */}
      <div className="bg-[#171A18] border border-white/[0.08] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E221F] border border-white/10 flex items-center justify-center text-[#8FAF87]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F1EDE3]">Stock Movement Ledger</h2>
            <p className="text-[11px] text-[#A8A295] font-mono">Real-time immutable audit trail recorded in PostgreSQL</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0B0D0C] border border-white/10 rounded-lg text-xs font-mono text-[#F1EDE3] focus:border-[#8FAF87] focus:outline-none"
          >
            <option value="ALL">All Movements</option>
            <option value="RECEIVED">Goods Received</option>
            <option value="SOLD">Sales</option>
            <option value="DAMAGED">Damaged / Expired</option>
            <option value="CUSTOMER_RETURN">Customer Returns</option>
            <option value="CORRECTION">Count Adjustments</option>
          </select>

          <button
            onClick={fetchMovements}
            className="p-1.5 rounded-lg bg-[#1E221F] hover:bg-[#282D2A] text-[#A8A295] hover:text-white transition border border-white/[0.05]"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#8FAF87]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-[#171A18] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#0B0D0C]/80 text-[10px] font-mono uppercase tracking-wider text-[#A8A295]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Item &amp; Section</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Delta Units</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Authorized By / Reason</th>
                <th className="py-3 px-4">Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A8A295]">
                    <p className="font-medium text-sm text-[#F1EDE3]">No stock movements recorded</p>
                    <p className="text-xs text-[#A8A295] mt-0.5 font-mono">Physical transactions will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(m => {
                  const isPositive = m.quantity_change > 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#1E221F]/60 transition-colors">
                      
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#A8A295] whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString([], {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Item Name */}
                      <td className="py-3 px-4 font-medium text-[#F1EDE3]">
                        <div>{m.item_name || `Item #${m.item_id}`}</div>
                        <span className="text-[10px] font-mono text-[#7C776C]">{m.section}</span>
                      </td>

                      {/* Movement Type */}
                      <td className="py-3 px-4">
                        {getTypeBadge(m.movement_type)}
                      </td>

                      {/* Delta Units */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isPositive ? 'text-[#8FAF87]' : 'text-[#C65A4A]'}>
                          {isPositive ? `+${m.quantity_change}` : m.quantity_change}
                        </span>
                      </td>

                      {/* New Stock Balance */}
                      <td className="py-3 px-4 text-right font-mono text-[#F1EDE3] font-semibold">
                        {m.new_stock}
                      </td>

                      {/* Author / Reason */}
                      <td className="py-3 px-4 text-[11px] text-[#A8A295]">
                        <div className="text-[#F1EDE3] font-medium">{m.user_name || 'System User'}</div>
                        <div className="text-[10px] text-[#7C776C] truncate max-w-[180px]">
                          {m.supplier_or_reason || '—'}
                        </div>
                      </td>

                      {/* Channel: AI Agent vs Manual */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {m.source_type === 'AI_AGENT' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#8FAF87] bg-[#8FAF87]/10 px-2 py-0.5 rounded border border-[#8FAF87]/20">
                            <Sparkles className="w-2.5 h-2.5" />
                            Store Brain AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A8A295] bg-[#0B0D0C] px-2 py-0.5 rounded border border-white/[0.05]">
                            <Keyboard className="w-2.5 h-2.5" />
                            Manual Entry
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
