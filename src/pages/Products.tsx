import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Package, Search } from 'lucide-react';
import { Product } from '../types';

function ProductModal({ product, onClose, onSave }: { product: Partial<Product> | null; onClose: () => void; onSave: (p: Partial<Product>) => void }) {
  const [form, setForm] = useState<Partial<Product>>(product || { name: '', category: 'Software', price: 0, tier: 'basic', inventory: 0, description: '', sku: '', active: true });

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
              <input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Inventory</label>
              <input type="number" value={form.inventory || 0} onChange={e => setForm({ ...form, inventory: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">SKU</label>
            <input value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Products</h2>
        <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-blue-500/50 transition-colors">
            <div className="w-full h-32 bg-slate-700/50 rounded-lg flex items-center justify-center mb-4">
              <Package size={40} className="text-slate-500" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.sku}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[p.tier]}`}>{p.tier}</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-blue-400">{formatCurrency(p.price)}<span className="text-xs text-slate-500">/mo</span></span>
              <span className="text-xs text-slate-400">Stock: {p.inventory}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${p.active ? 'text-green-400' : 'text-red-400'}`}>{p.active ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Edit2 size={14} /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={handleSave} />}
    </div>
  );
}
