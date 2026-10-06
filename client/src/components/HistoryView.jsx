import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
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
  ArrowUpFromLine,
  Bot
} from 'lucide-react';

export default function HistoryView({ refreshTrigger }) {
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <ArrowDownToLine className="w-3 h-3" />
            <span>RECEIVED</span>
          </span>
        );
      case 'SOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <ArrowUpFromLine className="w-3 h-3" />
            <span>SOLD</span>
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <AlertCircle className="w-3 h-3" />
            <span>DAMAGED</span>
          </span>
        );
      case 'CUSTOMER_RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FB923C]/15 text-[#FB923C] border border-[#FB923C]/30">
            <RotateCcw className="w-3 h-3" />
            <span>RETURN</span>
          </span>
        );
      case 'CORRECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#292524] text-[#A8A29E] border border-[#38332E]">
            <SlidersHorizontal className="w-3 h-3" />
            <span>ADJUSTMENT</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#292524] text-white">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Filter Control Bar */}
      <div className="bg-[#1C1917] border border-[#38332E] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#292524] border border-[#38332E] flex items-center justify-center text-[#F59E0B]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#FAFAF9]">Stock Movement Ledger</h2>
            <p className="text-[11px] text-[#A8A29E] font-mono">Real-time immutable audit trail recorded in PostgreSQL</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs font-mono text-[#FAFAF9] focus:border-[#F59E0B] focus:outline-none"
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
            className="p-1.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] text-[#A8A29E] hover:text-[#FAFAF9] transition border border-[#38332E]"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F59E0B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#38332E] bg-[#0C0A09]/90 text-[10px] font-mono uppercase tracking-wider text-[#A8A29E]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Item &amp; Section</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Delta Units</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4">Authorized By / Reason</th>
                <th className="py-3 px-4">Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38332E]/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#A8A29E]">
                    <Clock className="w-8 h-8 text-[#78716C]/40 mx-auto mb-2" />
                    <p className="font-medium text-sm text-[#FAFAF9]">No stock movements recorded</p>
                    <p className="text-xs text-[#A8A29E] mt-0.5 font-mono">Physical transactions will appear here automatically.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(m => {
                  const isPositive = m.quantity_change > 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#292524]/60 transition-colors">
                      
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#A8A29E] whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString([], {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Item Name */}
                      <td className="py-3 px-4 font-medium text-[#FAFAF9]">
                        <div>{m.item_name || `Item #${m.item_id}`}</div>
                        <span className="text-[10px] font-mono text-[#78716C]">{m.section}</span>
                      </td>

                      {/* Movement Type */}
                      <td className="py-3 px-4">
                        {getTypeBadge(m.movement_type)}
                      </td>

                      {/* Delta Units */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isPositive ? 'text-[#FBBF24]' : 'text-[#EF4444]'}>
                          {isPositive ? `+${m.quantity_change}` : m.quantity_change}
                        </span>
                      </td>

                      {/* New Stock Balance */}
                      <td className="py-3 px-4 text-right font-mono text-[#FAFAF9] font-semibold">
                        {m.new_stock}
                      </td>

                      {/* Author / Reason */}
                      <td className="py-3 px-4 text-[11px] text-[#A8A29E]">
                        <div className="text-[#FAFAF9] font-medium">{m.user_name || 'System User'}</div>
                        <div className="text-[10px] font-mono text-[#78716C] truncate max-w-[180px]">
                          {m.supplier_or_reason || '—'}
                        </div>
                      </td>

                      {/* Channel: AI Agent vs Manual */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {m.source_type === 'AI_AGENT' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#FB923C] bg-[#F97316]/15 px-2 py-0.5 rounded border border-[#F97316]/30">
                            <Bot className="w-2.5 h-2.5" />
                            Store Brain AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A8A29E] bg-[#0C0A09] px-2 py-0.5 rounded border border-[#38332E]">
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
