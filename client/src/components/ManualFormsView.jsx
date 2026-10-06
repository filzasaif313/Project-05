import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  AlertOctagon, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function ManualFormsView({ items, onStockUpdated }) {
  const [activeTab, setActiveTab] = useState('RECEIVED');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [quantity, setQuantity] = useState('');
  const [countValue, setCountValue] = useState('');
  const [supplierOrReason, setSupplierOrReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState(null);

  const selectedItem = items.find(i => i.id === parseInt(selectedItemId, 10)) || items[0];

  const tabs = [
    { id: 'RECEIVED', label: 'Receive Goods', icon: ArrowDownToLine, desc: 'Deliveries from suppliers' },
    { id: 'SOLD', label: 'Point of Sale', icon: ArrowUpFromLine, desc: 'Sales to shoppers' },
    { id: 'DAMAGED', label: 'Damaged / Write-off', icon: AlertOctagon, desc: 'Broken or defective' },
    { id: 'CUSTOMER_RETURN', label: 'Customer Return', icon: RotateCcw, desc: 'Returned items' },
    { id: 'CORRECTION', label: 'Count Adjustment', icon: Sliders, desc: 'Physical audit count' }
  ];

  // Live Math preview
  const currentStock = selectedItem ? selectedItem.total_stock : 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  let plannedDelta = 0;

  if (activeTab === 'CORRECTION') {
    const parsedCount = parseInt(countValue, 10);
    plannedDelta = !isNaN(parsedCount) ? parsedCount - currentStock : 0;
  } else if (activeTab === 'RECEIVED' || activeTab === 'CUSTOMER_RETURN') {
    plannedDelta = parsedQty;
  } else if (activeTab === 'SOLD' || activeTab === 'DAMAGED') {
    plannedDelta = -parsedQty;
  }

  const projectedStock = activeTab === 'CORRECTION' && countValue !== '' 
    ? parseInt(countValue, 10) 
    : currentStock + plannedDelta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultStatus(null);
    setSubmitting(true);

    try {
      const payload = {
        itemId: selectedItem.id,
        movementType: activeTab,
        quantity: parsedQty,
        countValue: activeTab === 'CORRECTION' ? parseInt(countValue, 10) : undefined,
        supplierOrReason: supplierOrReason.trim()
      };

      const res = await api.recordManualMovement(payload);
      setResultStatus({
        type: 'success',
        message: res.message || 'Stock updated successfully',
        oldStock: res.item?.oldStock,
        newStock: res.item?.newStock,
      });

      // Clear fields
      setQuantity('');
      setCountValue('');
      setSupplierOrReason('');

      if (onStockUpdated) onStockUpdated();
    } catch (err) {
      setResultStatus({
        type: 'error',
        message: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      
      {/* Header Info */}
      <div className="bg-[#1C1917] border border-[#38332E] p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold tracking-wider">
            OPERATIONAL ENTRY TERMINAL
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-[#FAFAF9] tracking-tight">Manual Stock Operations</h2>
        <p className="text-xs text-[#A8A29E] mt-1">
          Direct physical stock movement entry. All transactions generate immediate audit ledger entries in PostgreSQL.
        </p>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-4 pt-3.5 border-t border-[#38332E]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResultStatus(null);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-[#292524] border-[#F59E0B]/60 text-[#FAFAF9] shadow-sm'
                    : 'bg-[#0C0A09] border-[#38332E] text-[#A8A29E] hover:text-[#FAFAF9] hover:bg-[#292524]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#78716C]'}`} />
                <span className="text-[11px] font-mono font-semibold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Form Card */}
      <div className="bg-[#1C1917] border border-[#38332E] p-5 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Item Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#A8A29E] block mb-1.5">
              Select Catalog SKU
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.section}) — Current Stock: {item.total_stock}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Math Preview Bar */}
          {selectedItem && (
            <div className="bg-[#0C0A09] border border-[#38332E] p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider block">Current Stock</span>
                <span className="text-base font-mono font-bold text-[#FAFAF9]">{currentStock}</span>
              </div>

              <div className="text-center font-mono text-sm font-bold">
                <span className={plannedDelta > 0 ? 'text-[#FBBF24]' : plannedDelta < 0 ? 'text-[#EF4444]' : 'text-[#A8A29E]'}>
                  {plannedDelta > 0 ? `+${plannedDelta}` : plannedDelta}
                </span>
                <span className="text-[10px] text-[#78716C] block font-mono">delta</span>
              </div>

              <ArrowRight className="w-4 h-4 text-[#78716C]" />

              <div className="text-right">
                <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider block">Projected Stock</span>
                <span className={`text-base font-mono font-black ${
                  projectedStock < 0 ? 'text-[#EF4444]' : 'text-[#FBBF24]'
                }`}>
                  {projectedStock}
                </span>
              </div>
            </div>
          )}

          {/* Input: Quantity (or Count for Correction) */}
          {activeTab === 'CORRECTION' ? (
            <div>
              <label className="text-[11px] font-mono uppercase text-[#A8A29E] block mb-1.5">
                New Counted Physical Units
              </label>
              <input
                type="number"
                min="0"
                required
                value={countValue}
                onChange={(e) => setCountValue(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-mono uppercase text-[#A8A29E] block mb-1.5">
                Quantity Units
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          )}

          {/* Supplier or Reason */}
          <div>
            <label className="text-[11px] font-mono uppercase text-[#A8A29E] block mb-1.5">
              {activeTab === 'RECEIVED' ? 'Supplier Name (e.g. Ali Traders)' : 'Reason / Reference Note'}
            </label>
            <input
              type="text"
              required={activeTab === 'RECEIVED' || activeTab === 'DAMAGED'}
              value={supplierOrReason}
              onChange={(e) => setSupplierOrReason(e.target.value)}
              placeholder={activeTab === 'RECEIVED' ? 'e.g. Ali Traders, Lahore Wholesale' : 'e.g. Counter sales batch, Customer return'}
              className="w-full px-3.5 py-2.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          {/* Success or Error Status Banner */}
          {resultStatus && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
              resultStatus.type === 'success'
                ? 'bg-[#FBBF24]/15 border-[#FBBF24]/35 text-[#FAFAF9]'
                : 'bg-[#EF4444]/15 border-[#EF4444]/35 text-[#EF4444]'
            }`}>
              {resultStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{resultStatus.message}</p>
                {resultStatus.oldStock != null && (
                  <p className="text-[11px] text-[#A8A29E] font-mono mt-0.5">
                    Updated in PostgreSQL Ledger: {resultStatus.oldStock} → {resultStatus.newStock}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0C0A09] font-mono text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Recording in Ledger...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Stock Movement</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
