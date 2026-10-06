import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StorePulseIndicator from './StorePulseIndicator';
import { 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Tag, 
  ShieldCheck, 
  RefreshCw,
  Warehouse
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
      <div className="py-24 text-center text-[#A8A29E]">
        <div className="inline-block w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-mono font-medium text-[#FAFAF9]">
          Auditing Nowshera Shopping Mall financial ledger...
        </p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const topSellers = data?.topSellers || [];
  const lowStock = data?.lowStockItems || [];

  return (
    <div className="space-y-5">
      
      {/* Confidential Financial Notice */}
      <div className="p-3.5 rounded-2xl bg-[#1C1917] border border-[#FBBF24]/30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div>
            <p className="text-xs text-[#FAFAF9] font-medium">
              <span className="font-bold text-[#FBBF24]">Manager Financial Command:</span> Cost prices, gross margins, and historical store revenue are strictly restricted to your manager credentials.
            </p>
          </div>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-1.5 rounded-xl bg-[#0C0A09] hover:bg-[#292524] text-[#A8A29E] hover:text-[#FBBF24] border border-[#38332E] transition"
          title="Refresh Financials"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 4 Financial KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#1C1917] border border-[#38332E] rounded-2xl divide-y lg:divide-y-0 lg:divide-x divide-[#38332E] overflow-hidden">
        
        {/* Card 1: Sales Revenue */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Sales Revenue
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#FAFAF9] font-mono mt-1.5">
            Rs {summary.totalRevenue ? summary.totalRevenue.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#FBBF24] font-mono mt-1">Real ledger movements</p>
        </div>

        {/* Card 2: Realized Gross Profit */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Realized Gross Profit
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#FBBF24]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#FBBF24] font-mono mt-1.5">
            Rs {summary.totalGrossProfit ? summary.totalGrossProfit.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#A8A29E] font-mono mt-1">
            Store Gross Margin: <span className="text-[#FBBF24] font-bold">{summary.grossMarginPercentage}%</span>
          </p>
        </div>

        {/* Card 3: Inventory Retail Valuation */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Inventory Valuation
            </span>
            <Warehouse className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#FAFAF9] font-mono mt-1.5">
            Rs {summary.retailValue ? summary.retailValue.toLocaleString() : '0'}
          </h3>
          <p className="text-[10px] text-[#78716C] font-mono mt-1">
            Wholesale Cost: Rs {summary.costValue ? summary.costValue.toLocaleString() : '0'}
          </p>
        </div>

        {/* Card 4: Low Stock Action Items */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[#A8A29E]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Reorder Attention
            </span>
            <AlertTriangle className={`w-3.5 h-3.5 ${summary.lowStockCount > 0 ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
          </div>
          <h3 className={`text-2xl font-extrabold font-mono mt-1.5 ${summary.lowStockCount > 0 ? 'text-[#F59E0B]' : 'text-[#FAFAF9]'}`}>
            {summary.lowStockCount} SKUs
          </h3>
          <p className="text-[10px] text-[#F59E0B]/90 font-mono mt-1">
            At or below threshold
          </p>
        </div>

      </div>

      {/* Two Column Section: Bestsellers vs Low Stock Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Bestsellers Table */}
        <div className="bg-[#1C1917] rounded-2xl border border-[#38332E] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                Top Selling Products This Week
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#A8A29E]">
              {topSellers.length} Ranked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#38332E] text-[#A8A29E] text-[10px] font-mono uppercase">
                  <th className="py-2.5 px-2">Item</th>
                  <th className="py-2.5 px-2 text-center">Units Sold</th>
                  <th className="py-2.5 px-2 text-right">Revenue</th>
                  <th className="py-2.5 px-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38332E]/50">
                {topSellers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#A8A29E] italic text-xs font-mono">
                      No sales recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  topSellers.map(seller => (
                    <tr key={seller.id} className="hover:bg-[#292524]/60 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-[#FAFAF9]">{seller.name}</div>
                        <span className="text-[10px] font-mono text-[#78716C]">{seller.section}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-black font-mono text-[#FBBF24]">
                        {seller.unitsSold}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[#FAFAF9]">
                        Rs {seller.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-[#FBBF24]">
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
        <div className="bg-[#1C1917] rounded-2xl border border-[#38332E] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
                Store Reorder Radar
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#F59E0B]">
              {lowStock.length} Items Flagged
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar">
            {lowStock.length === 0 ? (
              <div className="py-12 text-center text-[#A8A29E] text-xs">
                <StorePulseIndicator status="HEALTHY" size="md" showLabel={true} />
                <p className="mt-2 text-[#FAFAF9] font-medium font-mono">All items above reorder thresholds</p>
                <p className="text-[11px] text-[#78716C] mt-0.5 font-mono">Store Pulse indicates optimal shelf buffer.</p>
              </div>
            ) : (
              lowStock.map(it => (
                <div key={it.id} className="p-3 rounded-xl bg-[#0C0A09] border border-[#38332E] flex items-center justify-between hover:border-[#F59E0B]/40 transition">
                  <div>
                    <h4 className="font-bold text-xs text-[#FAFAF9]">{it.name}</h4>
                    <p className="text-[10px] font-mono text-[#A8A29E] mt-0.5">
                      Front: {it.front_display || 'N/A'} • Backroom: {it.back_store_room || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono block ${it.total_stock <= 0 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                      {it.total_stock} units
                    </span>
                    <span className="text-[9px] text-[#78716C] font-mono uppercase">
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
      <div className="bg-[#1C1917] rounded-2xl border border-[#38332E] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#38332E] pb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-xs font-mono font-bold text-[#FAFAF9] uppercase tracking-wider">
              Price Modification Audit Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#A8A29E]">
            Immutable Price Tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#38332E] text-[#A8A29E] text-[10px] font-mono uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-center">Selling Price Transition</th>
                <th className="py-2.5 px-3 text-center">Cost Price Transition</th>
                <th className="py-2.5 px-3">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38332E]/50">
              {priceHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#A8A29E] text-xs font-mono italic">
                    No price changes recorded yet. Use the Catalog to adjust retail or wholesale prices.
                  </td>
                </tr>
              ) : (
                priceHistory.map(ph => (
                  <tr key={ph.id} className="hover:bg-[#292524]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#78716C] font-mono text-[11px]">
                      {new Date(ph.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#FAFAF9]">
                      {ph.item_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-[#A8A29E]">Rs {ph.old_selling_price}</span>
                      <span className="text-[#78716C] mx-1.5">→</span>
                      <span className="font-bold text-[#FBBF24]">Rs {ph.new_selling_price}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-[#A8A29E]">Rs {ph.old_cost_price}</span>
                      <span className="text-[#78716C] mx-1.5">→</span>
                      <span className="font-bold text-[#FAFAF9]">Rs {ph.new_cost_price}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#FBBF24] font-mono text-[11px]">
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
