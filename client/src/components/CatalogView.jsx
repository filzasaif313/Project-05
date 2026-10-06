import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StorePulseIndicator, { getStorePulseStatus } from './StorePulseIndicator';
import { 
  Search, 
  AlertTriangle, 
  MapPin, 
  Warehouse, 
  Edit3, 
  DollarSign, 
  Boxes, 
  Check, 
  X,
  Package,
  LayoutGrid,
  List,
  Filter,
  Tag,
  ArrowRight
} from 'lucide-react';

export default function CatalogView({ items, loading, onRefresh, onOpenOperationsWithItem }) {
  const { isManager, isStaff } = useAuth();
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
      <div className="bg-[#171A18] border border-white/[0.08] p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#A8A295] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items, shelf, rack, section..."
            className="w-full pl-9 pr-8 py-2 bg-[#0B0D0C] border border-white/10 rounded-lg text-xs text-[#F1EDE3] placeholder-[#7C776C] focus:outline-none focus:border-[#8FAF87]/50 transition"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A295] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & View Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          
          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-lg border border-white/[0.07]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition ${
                statusFilter === 'ALL' 
                  ? 'bg-[#1E221F] text-[#F1EDE3] font-bold shadow-sm' 
                  : 'text-[#A8A295] hover:text-[#F1EDE3]'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition flex items-center gap-1 ${
                statusFilter === 'LOW' 
                  ? 'bg-[#D6A85F]/20 text-[#D6A85F] font-bold border border-[#D6A85F]/35' 
                  : 'text-[#A8A295] hover:text-[#D6A85F]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F]" />
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter('OUT')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition flex items-center gap-1 ${
                statusFilter === 'OUT' 
                  ? 'bg-[#C65A4A]/20 text-[#C65A4A] font-bold border border-[#C65A4A]/35' 
                  : 'text-[#A8A295] hover:text-[#C65A4A]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C65A4A]" />
              Zero
            </button>
          </div>

          {/* Toggle Grid vs Table */}
          <div className="flex items-center bg-[#0B0D0C] p-1 rounded-lg border border-white/[0.07]">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'TABLE' ? 'bg-[#1E221F] text-[#8FAF87]' : 'text-[#7C776C] hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'GRID' ? 'bg-[#1E221F] text-[#8FAF87]' : 'text-[#7C776C] hover:text-white'
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
        <div className="bg-[#171A18] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#0B0D0C]/80 text-[10px] font-mono uppercase tracking-wider text-[#A8A295]">
                  <th className="py-3 px-4">Item &amp; Section</th>
                  <th className="py-3 px-4">Store Pulse Status</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4">Locations (Shelf / Back)</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  {isManager && <th className="py-3 px-4 text-right">Cost Price</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={isManager ? 7 : 6} className="py-12 text-center text-[#A8A295]">
                      <Boxes className="w-8 h-8 text-[#7C776C]/40 mx-auto mb-2" />
                      <p className="font-medium text-sm text-[#F1EDE3]">No catalog items found</p>
                      <p className="text-xs text-[#A8A295] mt-0.5 font-mono">Try searching with a different keyword or resetting filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const pulseStatus = getStorePulseStatus(item.total_stock, item.low_stock_threshold);
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-[#1E221F]/70 transition-colors group"
                      >
                        {/* Name & Section */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#F1EDE3] group-hover:text-[#8FAF87] transition-colors">
                            {item.name}
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-mono text-[#7C776C]">
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
                              ? 'text-[#C65A4A]' 
                              : item.total_stock <= item.low_stock_threshold 
                                ? 'text-[#D6A85F]' 
                                : 'text-[#F1EDE3]'
                          }`}>
                            {item.total_stock}
                          </span>
                          <span className="text-[10px] text-[#7C776C] block">
                            min: {item.low_stock_threshold}
                          </span>
                        </td>

                        {/* Locations */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex items-center gap-1.5 text-[#F1EDE3]">
                              <MapPin className="w-3 h-3 text-[#8FAF87] shrink-0" />
                              <span className="truncate max-w-[140px]">{item.front_display || 'Not on display'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#A8A295]">
                              <Warehouse className="w-3 h-3 text-[#7C776C] shrink-0" />
                              <span className="truncate max-w-[140px]">{item.back_store_room || 'No back stock'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#F1EDE3]">
                          Rs {parseFloat(item.selling_price).toLocaleString()}
                        </td>

                        {/* Cost Price (Strictly Manager Only) */}
                        {isManager && (
                          <td className="py-3 px-4 text-right font-mono text-[#8FAF87]">
                            {item.cost_price != null ? (
                              <>
                                <div>Rs {parseFloat(item.cost_price).toLocaleString()}</div>
                                <div className="text-[10px] text-[#A8A295]">
                                  +Rs {(parseFloat(item.selling_price) - parseFloat(item.cost_price)).toLocaleString()}
                                </div>
                              </>
                            ) : (
                              <span className="text-[#7C776C]">-</span>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg bg-[#1E221F] hover:bg-[#282D2A] text-[#A8A295] hover:text-[#8FAF87] transition border border-white/[0.05]"
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
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map(item => {
            const pulseStatus = getStorePulseStatus(item.total_stock, item.low_stock_threshold);
            return (
              <div 
                key={item.id}
                className="bg-[#171A18] hover:bg-[#1E221F] border border-white/[0.08] hover:border-[#8FAF87]/30 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase text-[#A8A295] bg-[#0B0D0C] px-2 py-0.5 rounded border border-white/[0.05]">
                      {item.section}
                    </span>
                    <StorePulseIndicator status={pulseStatus} size="sm" showLabel={true} />
                  </div>

                  <h3 className="font-bold text-sm text-[#F1EDE3] leading-snug">
                    {item.name}
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-2 bg-[#0B0D0C] p-2.5 rounded-lg border border-white/[0.05]">
                    <div>
                      <span className="text-[10px] text-[#A8A295] uppercase font-mono tracking-wider block">Quantity</span>
                      <span className="text-lg font-mono font-extrabold text-[#F1EDE3]">
                        {item.total_stock}
                      </span>
                      <span className="text-[10px] text-[#7C776C] font-mono block">min: {item.low_stock_threshold}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#A8A295] uppercase font-mono tracking-wider block">Retail Price</span>
                      <span className="text-sm font-mono font-bold text-[#F1EDE3]">
                        Rs {parseFloat(item.selling_price).toLocaleString()}
                      </span>
                      {isManager && item.cost_price != null && (
                        <span className="text-[10px] text-[#8FAF87] font-mono block">
                          Cost: Rs {parseFloat(item.cost_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-[#A8A295]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-[#8FAF87] shrink-0" />
                      <span className="truncate">Shelf: {item.front_display || 'Not on display'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Warehouse className="w-3 h-3 text-[#7C776C] shrink-0" />
                      <span className="truncate">Back: {item.back_store_room || 'No back room'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#7C776C]">SKU #{item.id}</span>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#8FAF87] hover:text-white transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D0C]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#171A18] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-[#F1EDE3]">Edit Inventory Item</h3>
                <p className="text-[11px] font-mono text-[#A8A295] truncate max-w-xs">{editingItem.name}</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-[#A8A295] hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              
              {/* Manager Price Controls */}
              {isManager && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0B0D0C] rounded-xl border border-white/10">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#A8A295] block mb-1">Selling Price (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPriceInput}
                      onChange={(e) => setSellingPriceInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#171A18] border border-white/10 rounded-lg text-white font-mono focus:border-[#8FAF87] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-[#8FAF87] block mb-1">Wholesale Cost (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={costPriceInput}
                      onChange={(e) => setCostPriceInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#171A18] border border-white/10 rounded-lg text-[#8FAF87] font-mono focus:border-[#8FAF87] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Shelf & Storage Locations */}
              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A295] block mb-1">Front Display Shelf</label>
                <input
                  type="text"
                  value={frontDisplayInput}
                  onChange={(e) => setFrontDisplayInput(e.target.value)}
                  placeholder="e.g. Shelf E1, Aisle 2"
                  className="w-full px-3 py-1.5 bg-[#0B0D0C] border border-white/10 rounded-lg text-[#F1EDE3] focus:border-[#8FAF87] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A295] block mb-1">Back Store Room Location</label>
                <input
                  type="text"
                  value={backStoreInput}
                  onChange={(e) => setBackStoreInput(e.target.value)}
                  placeholder="e.g. Storage Bay 1, Rack 4"
                  className="w-full px-3 py-1.5 bg-[#0B0D0C] border border-white/10 rounded-lg text-[#F1EDE3] focus:border-[#8FAF87] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-[#A8A295] block mb-1">Low Stock Warning Threshold</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0B0D0C] border border-white/10 rounded-lg text-[#F1EDE3] font-mono focus:border-[#8FAF87] focus:outline-none"
                />
              </div>

              {saveMessage && (
                <p className="text-[11px] font-semibold text-[#8FAF87] mt-2">{saveMessage}</p>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-[#A8A295] hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-[#8FAF87] text-[#0B0D0C] font-mono font-bold hover:bg-[#A5C49E] transition shadow-sm"
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
