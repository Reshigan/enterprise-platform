import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Package, Search, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ProductModal({ product, onClose, onSave }: { product: Partial<Product> | null; onClose: () => void; onSave: (p: Partial<Product>) => void }) {
  const [form, setForm] = useState<Partial<Product>>(product || { name: '', category: 'Software', price: 0, tier: 'basic', inventory: 0, description: '', sku: '', active: true, costPrice: 0, margin: 0, salesCount: 0 });

  const recalcMargin = (price: number, cost: number) => {
    return price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{product?.id ? 'Edit Product' : 'New Product'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={form.category || 'Software'} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option>Software</option><option>Add-on</option><option>Service</option><option>Hardware</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tier</label>
              <select value={form.tier || 'basic'} onChange={e => setForm({ ...form, tier: e.target.value as Product['tier'] })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
              <input type="number" value={form.price || 0} onChange={e => { const p = Number(e.target.value); setForm({ ...form, price: p, margin: recalcMargin(p, form.costPrice || 0) }); }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cost ($)</label>
              <input type="number" value={form.costPrice || 0} onChange={e => { const c = Number(e.target.value); setForm({ ...form, costPrice: c, margin: recalcMargin(form.price || 0, c) }); }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Margin</label>
              <div className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-green-400 font-medium">{form.margin || 0}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Inventory</label>
              <input type="number" value={form.inventory || 0} onChange={e => setForm({ ...form, inventory: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">SKU</label>
              <input value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.active ?? true} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded" />
            Active
          </label>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

const tierColors: Record<string, string> = { basic: 'bg-slate-500/20 text-slate-300', standard: 'bg-blue-500/20 text-blue-300', premium: 'bg-purple-500/20 text-purple-300' };

const MARGIN_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (form: Partial<Product>) => {
    if (form.id) updateProduct(form.id, form);
    else addProduct(form as Omit<Product, 'id'>);
    setShowModal(false);
    setEditProduct(null);
  };

  // Aggregate metrics
  const totalRevenue = products.reduce((s, p) => s + (p.price * p.salesCount), 0);
  const avgMargin = products.length > 0 ? Math.round(products.reduce((s, p) => s + p.margin, 0) / products.length * 10) / 10 : 0;
  const totalUnitsSold = products.reduce((s, p) => s + p.salesCount, 0);
  const topProduct = [...products].sort((a, b) => (b.price * b.salesCount) - (a.price * a.salesCount))[0];

  // Margin analysis chart data
  const marginData = products.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 12) + '...' : p.name,
    fullName: p.name,
    cost: p.costPrice,
    profit: p.price - p.costPrice,
    margin: p.margin,
  }));

  // Sales performance data
  const salesData = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .map(p => ({
      name: p.name.length > 12 ? p.name.slice(0, 10) + '...' : p.name,
      units: p.salesCount,
      revenue: Math.round((p.price * p.salesCount) / 1000),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      {/* Product KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-2"><DollarSign size={20} className="text-green-400" /></div>
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2"><TrendingUp size={20} className="text-blue-400" /></div>
          <p className="text-xs text-slate-400">Avg Margin</p>
          <p className="text-xl font-bold text-blue-400">{avgMargin}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2"><BarChart3 size={20} className="text-purple-400" /></div>
          <p className="text-xs text-slate-400">Total Units Sold</p>
          <p className="text-xl font-bold text-purple-400">{totalUnitsSold.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2"><Package size={20} className="text-amber-400" /></div>
          <p className="text-xs text-slate-400">Top Product</p>
          <p className="text-sm font-bold text-amber-400 truncate">{topProduct?.name || '-'}</p>
          <p className="text-xs text-slate-500">{topProduct ? formatCurrency(topProduct.price * topProduct.salesCount) : ''}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Analysis */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Margin Analysis (Cost vs Profit)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={marginData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'cost' ? 'Cost' : 'Profit']}
                labelFormatter={(_label: string, payload: Array<{ payload?: { fullName?: string } }>) => payload[0]?.payload?.fullName || _label}
              />
              <Bar dataKey="cost" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} name="cost" />
              <Bar dataKey="profit" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} name="profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Performance */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Sales Performance (Revenue $K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="revenue" name="Revenue ($K)">
                {salesData.map((_, i) => <Cell key={i} fill={MARGIN_COLORS[i % MARGIN_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const efficiency = p.salesCount > 0 ? Math.round(p.margin * Math.log10(p.salesCount + 1) * 10) / 10 : 0;
          return (
            <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 transition-colors">
              <div className="w-full h-24 bg-slate-700/50 rounded-lg flex items-center justify-center mb-3">
                <Package size={32} className="text-slate-500" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.sku}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[p.tier]}`}>{p.tier}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>

              {/* Price & Margin */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-blue-400">{formatCurrency(p.price)}<span className="text-xs text-slate-500">/mo</span></span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${p.margin >= 70 ? 'text-green-400 bg-green-500/20' : p.margin >= 50 ? 'text-amber-400 bg-amber-500/20' : 'text-red-400 bg-red-500/20'}`}>{p.margin}%</span>
              </div>

              {/* Margin bar */}
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                <div className={`h-1.5 rounded-full ${p.margin >= 70 ? 'bg-green-500' : p.margin >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(p.margin, 100)}%` }} />
              </div>

              {/* Sales metrics */}
              <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                <div className="bg-slate-900/50 rounded p-1.5">
                  <p className="text-xs text-slate-500">Sold</p>
                  <p className="text-xs font-bold text-white">{p.salesCount}</p>
                </div>
                <div className="bg-slate-900/50 rounded p-1.5">
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="text-xs font-bold text-green-400">{formatCurrency(p.price * p.salesCount)}</p>
                </div>
                <div className="bg-slate-900/50 rounded p-1.5">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className={`text-xs font-bold ${efficiency >= 150 ? 'text-green-400' : efficiency >= 80 ? 'text-blue-400' : 'text-slate-400'}`}>{efficiency}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${p.active ? 'text-green-400' : 'text-red-400'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                  <span className="text-xs text-slate-500">Stock: {p.inventory}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={handleSave} />}
    </div>
  );
}
