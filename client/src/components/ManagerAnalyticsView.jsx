import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StorePulseIndicator, { getStorePulseStatus } from './StorePulseIndicator';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Award, 
  Tag, 
  Boxes, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  Percent,
  Warehouse,
  FileSpreadsheet
} from 'lucide-react';

export default function ManagerAnalyticsView() {
  const [data, setData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsData, pricesData] = await Promise.all([
        api.getAnalytics(),
        api.getPriceHistory()
      ]);
      setData(analyticsData);
      setPriceHistory(pricesData.priceHistory || []);
    } catch (err) {
      console.error('Failed to load manager reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center text-[#A8A295]">
        <div className="inline-block w-8 h-8 border-2 border-[#8FAF87] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-mono font-medium text-[#F1EDE3]">
          Auditing Nowshera Shopping Mall financial ledger...
        </p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const topSellers = data?.topSellers || [];
  const lowStock = data?.lowStockItems || [];

  return (
    <div className="space-y-6">
      
      {/* Confidential Financial Notice */}
      <div className="p-3.5 rounded-xl bg-[#171A18] border border-[#8FAF87]/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#8FAF87]/15 border border-[#8FAF87]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#8FAF87]" />
          </div>
          <div>
            <p className="text-xs text-[#F1EDE3] font-medium">
              <span className="font-bold text-[#8FAF87]">Manager Financial Command:</span> Cost prices, gross margins, and historical store revenue are strictly restricted to your manager credentials.
            </p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-1.5 rounded-lg bg-[#1E221F] hover:bg-[#282D2A] text-[#A8A295] hover:text-[#8FAF87] border border-white/10 transition"
          title="Refresh Financials"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Sales Revenue */}
        <div className="bg-[#171A18] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A8A295] uppercase tracking-wider">
              Sales Revenue
            </span>
            <span className="w-2 h-2 rounded-full bg-[#8FAF87]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#F1EDE3] font-mono mt-2">
            Rs {summary.totalRevenue ? summary.totalRevenue.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#8FAF87] font-mono mt-1">Real sales movements</p>
        </div>

        {/* Card 2: Realized Gross Profit */}
        <div className="bg-[#171A18] border border-white/[0.08] hover:border-[#8FAF87]/30 p-4 rounded-xl transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A8A295] uppercase tracking-wider">
              Realized Gross Profit
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#8FAF87]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#8FAF87] font-mono mt-2">
            Rs {summary.totalGrossProfit ? summary.totalGrossProfit.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#A8A295] font-mono mt-1">
            Store Gross Margin: <span className="text-[#8FAF87] font-bold">{summary.grossMarginPercentage}%</span>
          </p>
        </div>

        {/* Card 3: Inventory Retail Valuation */}
        <div className="bg-[#171A18] border border-white/[0.08] hover:border-[#B8794A]/30 p-4 rounded-xl transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A8A295] uppercase tracking-wider">
              Inventory Valuation
            </span>
            <Warehouse className="w-3.5 h-3.5 text-[#B8794A]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#F1EDE3] font-mono mt-2">
            Rs {summary.retailValue ? summary.retailValue.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#7C776C] font-mono mt-1">
            Wholesale Cost: Rs {summary.costValue ? summary.costValue.toLocaleString() : '0'}
          </p>
        </div>

        {/* Card 4: Low Stock Action Items */}
        <div className="bg-[#171A18] border border-white/[0.08] hover:border-[#D6A85F]/35 p-4 rounded-xl transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A8A295] uppercase tracking-wider">
              Reorder Attention
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${summary.lowStockCount > 0 ? 'text-[#D6A85F]' : 'text-[#7C776C]'}`} />
          </div>
          <h3 className={`text-2xl font-extrabold font-mono mt-2 ${summary.lowStockCount > 0 ? 'text-[#D6A85F]' : 'text-[#F1EDE3]'}`}>
            {summary.lowStockCount} Items
          </h3>
          <p className="text-[10px] text-[#D6A85F]/90 font-mono mt-1">
            At or below reorder threshold
          </p>
        </div>

      </div>

      {/* Two Column Section: Bestsellers vs Low Stock Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bestsellers Table */}
        <div className="bg-[#171A18] rounded-xl border border-white/[0.08] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#8FAF87]" />
              <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
                Top Selling Products This Week
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#A8A295]">
              {topSellers.length} Ranked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-[#A8A295] text-[10px] font-mono uppercase">
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2 text-center">Units Sold</th>
                  <th className="py-2.5 px-2 text-right">Revenue</th>
                  <th className="py-2.5 px-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {topSellers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#A8A295] italic text-xs font-mono">
                      No sales recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  topSellers.map((seller, idx) => (
                    <tr key={seller.id} className="hover:bg-[#1E221F]/60 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-[#F1EDE3]">{seller.name}</div>
                        <span className="text-[10px] font-mono text-[#7C776C]">{seller.section}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black font-mono text-[#8FAF87]">
                        {seller.unitsSold}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[#F1EDE3]">
                        Rs {seller.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#8FAF87]">
                        +Rs {seller.grossProfit?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Reorder Radar */}
        <div className="bg-[#171A18] rounded-xl border border-white/[0.08] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D6A85F]" />
              <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
                Store Reorder Radar
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#D6A85F]">
              {lowStock.length} Items Flagged
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar">
            {lowStock.length === 0 ? (
              <div className="py-12 text-center text-[#A8A295] text-xs">
                <StorePulseIndicator status="HEALTHY" size="md" showLabel={true} />
                <p className="mt-2 text-[#F1EDE3] font-medium">All items above reorder thresholds</p>
                <p className="text-[11px] text-[#7C776C] mt-0.5">Store Pulse indicates optimal shelf buffer.</p>
              </div>
            ) : (
              lowStock.map(it => (
                <div key={it.id} className="p-3 rounded-lg bg-[#0B0D0C] border border-[#D6A85F]/20 flex items-center justify-between hover:border-[#D6A85F]/40 transition">
                  <div>
                    <h4 className="font-bold text-xs text-[#F1EDE3]">{it.name}</h4>
                    <p className="text-[10px] font-mono text-[#A8A295] mt-0.5">
                      Front: {it.front_display || 'N/A'} • Backroom: {it.back_store_room || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono block ${it.total_stock <= 0 ? 'text-[#C65A4A]' : 'text-[#D6A85F]'}`}>
                      {it.total_stock} units
                    </span>
                    <span className="text-[9px] text-[#7C776C] font-mono uppercase">
                      Reorder: {it.low_stock_threshold}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Price Modification Audit Log */}
      <div className="bg-[#171A18] rounded-xl border border-white/[0.08] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#8FAF87]" />
            <h3 className="text-xs font-mono font-bold text-[#F1EDE3] uppercase tracking-wider">
              Price Modification Audit Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#A8A295]">
            Immutable Price Tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] text-[#A8A295] text-[10px] font-mono uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-center">Selling Price Transition</th>
                <th className="py-2.5 px-3 text-center">Cost Price Transition</th>
                <th className="py-2.5 px-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {priceHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#A8A295] text-xs font-mono italic">
                    No price changes recorded yet. Use the Catalog to adjust retail or wholesale prices.
                  </td>
                </tr>
              ) : (
                priceHistory.map(ph => (
                  <tr key={ph.id} className="hover:bg-[#1E221F]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#7C776C] font-mono text-[11px]">
                      {new Date(ph.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#F1EDE3]">
                      {ph.item_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-[#A8A295]">Rs {ph.old_selling_price}</span>
                      <span className="text-white/20 mx-1.5">→</span>
                      <span className="font-bold text-[#8FAF87]">Rs {ph.new_selling_price}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-[#A8A295]">Rs {ph.old_cost_price}</span>
                      <span className="text-white/20 mx-1.5">→</span>
                      <span className="font-bold text-[#F1EDE3]">Rs {ph.new_cost_price}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8FAF87] font-mono text-[11px]">
                      {ph.changed_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
