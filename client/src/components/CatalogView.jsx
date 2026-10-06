import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StorePulseIndicator, { getStorePulseStatus } from './StorePulseIndicator';
import { 
  Search, 
  MapPin, 
  Warehouse, 
  Edit3, 
  Boxes, 
  X,
  LayoutGrid,
  List,
  ArrowRight
} from 'lucide-react';

export default function CatalogView({ items, loading, onRefresh }) {
  const { isManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW | OUT | HEALTHY
  const [viewMode, setViewMode] = useState('TABLE'); // TABLE | GRID
  const [editingItem, setEditingItem] = useState(null);
  
  // Edit Form State
  const [sellingPriceInput, setSellingPriceInput] = useState('');
  const [costPriceInput, setCostPriceInput] = useState('');
  const [frontDisplayInput, setFrontDisplayInput] = useState('');
  const [backStoreInput, setBackStoreInput] = useState('');
  const [thresholdInput, setThresholdInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Filter items locally by search query & Store Pulse status
  const filteredItems = items.filter(it => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      it.name.toLowerCase().includes(q) ||
      it.section.toLowerCase().includes(q) ||
      (it.front_display && it.front_display.toLowerCase().includes(q)) ||
      (it.back_store_room && it.back_store_room.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (statusFilter === 'LOW') return it.total_stock <= it.low_stock_threshold && it.total_stock > 0;
    if (statusFilter === 'OUT') return it.total_stock <= 0;
    if (statusFilter === 'HEALTHY') return it.total_stock > it.low_stock_threshold;
    return true;
  });

  const startEdit = (item) => {
    setEditingItem(item);
    setSellingPriceInput(item.selling_price);
    setCostPriceInput(item.cost_price || '');
    setFrontDisplayInput(item.front_display || '');
    setBackStoreInput(item.back_store_room || '');
    setThresholdInput(item.low_stock_threshold);
    setSaveMessage(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      if (isManager) {
        await api.updateItemPrice(editingItem.id, sellingPriceInput, costPriceInput || 0);
      }

      await api.updateItemDetails(editingItem.id, {
        front_display: frontDisplayInput,
        back_store_room: backStoreInput,
        low_stock_threshold: thresholdInput
      });

      setSaveMessage('Item details saved successfully!');
      setTimeout(() => {
        setEditingItem(null);
        onRefresh();
      }, 700);
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Control Bar: Search, Status Filter, and View Mode Toggle */}
      <div className="bg-[#1C1917] border border-[#38332E] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catalog, shelf, rack, section..."
            className="w-full pl-9 pr-8 py-2 bg-[#0C0A09] border border-[#38332E] rounded-xl text-xs text-[#FAFAF9] placeholder-[#78716C] focus:outline-none focus:border-[#F59E0B]/60 transition font-mono"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#FAFAF9]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & View Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          
          <div className="flex items-center gap-1 bg-[#0C0A09] p-1 rounded-xl border border-[#38332E]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition ${
                statusFilter === 'ALL' 
                  ? 'bg-[#292524] text-[#FAFAF9] font-bold shadow-sm' 
                  : 'text-[#A8A29E] hover:text-[#FAFAF9]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition flex items-center gap-1 ${
                statusFilter === 'LOW' 
                  ? 'bg-[#F97316]/20 text-[#F97316] font-bold border border-[#F97316]/35' 
                  : 'text-[#A8A29E] hover:text-[#F97316]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('OUT')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition flex items-center gap-1 ${
                statusFilter === 'OUT' 
                  ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold border border-[#EF4444]/35' 
                  : 'text-[#A8A29E] hover:text-[#EF4444]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              Zero
            </button>
          </div>

          {/* Toggle Grid vs Table */}
          <div className="flex items-center bg-[#0C0A09] p-1 rounded-xl border border-[#38332E]">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'TABLE' ? 'bg-[#292524] text-[#F59E0B]' : 'text-[#78716C] hover:text-[#FAFAF9]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'GRID' ? 'bg-[#292524] text-[#F59E0B]' : 'text-[#78716C] hover:text-[#FAFAF9]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Catalog View: Table Mode */}
      {viewMode === 'TABLE' ? (
        <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#38332E] bg-[#0C0A09]/90 text-[10px] font-mono uppercase tracking-wider text-[#A8A29E]">
                  <th className="py-3 px-4">Item &amp; Section</th>
                  <th className="py-3 px-4">Store Pulse Status</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4">Locations (Shelf / Back)</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  {isManager && <th className="py-3 px-4 text-right">Cost Price</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38332E]/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 6} className="py-12 text-center text-[#A8A29E]">
                      <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="font-medium text-sm text-[#FAFAF9]">Loading inventory telemetry...</p>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 6} className="py-12 text-center text-[#A8A29E]">
                      <Boxes className="w-8 h-8 text-[#78716C]/40 mx-auto mb-2" />
                      <p className="font-medium text-sm text-[#FAFAF9]">No catalog items found</p>
                      <p className="text-xs text-[#A8A29E] mt-0.5 font-mono">Try searching with a different keyword or resetting filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const pulseStatus = getStorePulseStatus(item.total_stock, item.low_stock_threshold);
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-[#292524]/60 transition-colors group"
                      >
                        {/* Name & Section */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#FAFAF9] group-hover:text-[#F59E0B] transition-colors">
                            {item.name}
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-mono text-[#78716C]">
                            {item.section}
                          </span>
                        </td>

                        {/* Store Pulse Indicator */}
                        <td className="py-3 px-4">
                          <StorePulseIndicator status={pulseStatus} size="sm" showLabel={true} />
                        </td>

                        {/* Quantity */}
                        <td className="py-3 px-4 text-right font-mono">
                          <span className={`text-sm font-bold ${
                            item.total_stock <= 0 
                              ? 'text-[#EF4444]' 
                              : item.total_stock <= item.low_stock_threshold 
                                ? 'text-[#F97316]' 
                                : 'text-[#FBBF24]'
                          }`}>
                            {item.total_stock}
                          </span>
                          <span className="text-[10px] text-[#78716C] block">
                            min: {item.low_stock_threshold}
                          </span>
                        </td>

                        {/* Locations */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-1.5 text-[#FAFAF9]">
                              <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
                              <span className="truncate max-w-[140px] font-mono">{item.front_display || 'Not on display'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#A8A29E]">
                              <Warehouse className="w-3 h-3 text-[#78716C] shrink-0" />
                              <span className="truncate max-w-[140px] font-mono">{item.back_store_room || 'No back stock'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#FAFAF9]">
                          Rs {parseFloat(item.selling_price).toLocaleString()}
                        </td>

                        {/* Cost Price (Strictly Manager Only) */}
                        {isManager && (
                          <td className="py-3 px-4 text-right font-mono text-[#FBBF24]">
                            {item.cost_price != null ? (
                              <>
                                <div>Rs {parseFloat(item.cost_price).toLocaleString()}</div>
                                <div className="text-[10px] text-[#A8A29E]">
                                  +Rs {(parseFloat(item.selling_price) - parseFloat(item.cost_price)).toLocaleString()}
                                </div>
                              </>
                            ) : (
                              <span className="text-[#78716C]">-</span>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg bg-[#0C0A09] hover:bg-[#292524] text-[#A8A29E] hover:text-[#F59E0B] transition border border-[#38332E]"
                            title="Edit Item Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : loading ? (
          <div className="py-16 text-center text-[#A8A29E] bg-[#1C1917] rounded-2xl border border-[#38332E]">
            <div className="w-6 h-6 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-medium text-sm text-[#FAFAF9]">Loading inventory telemetry...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-[#A8A29E] bg-[#1C1917] rounded-2xl border border-[#38332E]">
            <Boxes className="w-8 h-8 text-[#78716C]/40 mx-auto mb-2" />
            <p className="font-medium text-sm text-[#FAFAF9]">No catalog items found</p>
            <p className="text-xs text-[#A8A29E] mt-0.5 font-mono">Try searching with a different keyword or resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map(item => {
              const pulseStatus = getStorePulseStatus(item.total_stock, item.low_stock_threshold);
              return (
              <div 
                key={item.id} 
                className="bg-[#1C1917] hover:bg-[#292524]/70 border border-[#38332E] hover:border-[#F59E0B]/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#A8A29E] bg-[#0C0A09] px-2 py-0.5 rounded-lg border border-[#38332E]">
                      {item.section}
                    </span>
                    <StorePulseIndicator status={pulseStatus} size="sm" showLabel={true} />
                  </div>

                  <h3 className="font-bold text-sm text-[#FAFAF9] leading-snug">
                    {item.name}
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-2 bg-[#0C0A09] p-2.5 rounded-xl border border-[#38332E]">
                    <div>
                      <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider block">Quantity</span>
                      <span className="text-lg font-mono font-extrabold text-[#FAFAF9]">
                        {item.total_stock}
                      </span>
                      <span className="text-[10px] text-[#78716C] font-mono block">min: {item.low_stock_threshold}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#A8A29E] uppercase font-mono tracking-wider block">Retail Price</span>
                      <span className="text-sm font-mono font-bold text-[#FAFAF9]">
                        Rs {parseFloat(item.selling_price).toLocaleString()}
                      </span>
                      {isManager && item.cost_price != null && (
                        <span className="text-[10px] text-[#FBBF24] font-mono block">
                          Cost: Rs {parseFloat(item.cost_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-[#A8A29E]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
                      <span className="truncate font-mono">Shelf: {item.front_display || 'Not on display'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Warehouse className="w-3 h-3 text-[#78716C] shrink-0" />
                      <span className="truncate font-mono">Back: {item.back_store_room || 'No back room'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#38332E] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#78716C]">SKU #{item.id}</span>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#F59E0B] hover:text-[#FAFAF9] transition"
                  >
                    <span>Edit item</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal (Role Aware) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C0A09]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1917] border border-[#38332E] rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#38332E]">
              <div>
                <h3 className="font-bold text-sm text-[#FAFAF9]">Edit Inventory Item</h3>
                <p className="text-[11px] font-mono text-[#A8A29E] truncate max-w-xs">{editingItem.name}</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-[#A8A29E] hover:text-[#FAFAF9] p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              
              {/* Manager Price Controls */}
              {isManager && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0C0A09] rounded-xl border border-[#38332E]">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#A8A29E] block mb-1">Selling Price (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPriceInput}
                      onChange={(e) => setSellingPriceInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#292524] border border-[#38332E] rounded-lg text-white font-mono focus:border-[#F59E0B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#FBBF24] block mb-1">Wholesale Cost (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={costPriceInput}
                      onChange={(e) => setCostPriceInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#292524] border border-[#38332E] rounded-lg text-[#FBBF24] font-mono focus:border-[#FBBF24] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Shelf & Storage Locations */}
              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A29E] block mb-1">Front Display Shelf</label>
                <input
                  type="text"
                  value={frontDisplayInput}
                  onChange={(e) => setFrontDisplayInput(e.target.value)}
                  placeholder="e.g. Shelf E1, Aisle 2"
                  className="w-full px-3 py-1.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A29E] block mb-1">Back Store Room Location</label>
                <input
                  type="text"
                  value={backStoreInput}
                  onChange={(e) => setBackStoreInput(e.target.value)}
                  placeholder="e.g. Storage Bay 1, Rack 4"
                  className="w-full px-3 py-1.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A29E] block mb-1">Low Stock Warning Threshold</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0C0A09] border border-[#38332E] rounded-xl text-[#FAFAF9] font-mono focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              {saveMessage && (
                <p className="text-[11px] font-mono font-semibold text-[#FBBF24] mt-2">{saveMessage}</p>
              )}

              <div className="pt-3 border-t border-[#38332E] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-xl border border-[#38332E] text-[#A8A29E] hover:text-white hover:bg-white/5 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-[#F59E0B] text-[#0C0A09] font-mono font-bold hover:bg-[#D97706] transition shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
