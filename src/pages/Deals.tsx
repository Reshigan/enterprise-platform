import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency } from '../lib/utils';
import { Plus, X, GripVertical } from 'lucide-react';
import { Deal, DealStage } from '../types';

const STAGES: { key: DealStage; label: string; color: string }[] = [
  { key: 'prospect', label: 'Prospect', color: 'border-slate-500' },
  { key: 'qualified', label: 'Qualified', color: 'border-blue-500' },
  { key: 'proposal', label: 'Proposal', color: 'border-amber-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-purple-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'border-green-500' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'border-red-500' },
];

function DealCard({ deal, onEdit, onDragStart }: { deal: Deal; onEdit: (d: Deal) => void; onDragStart: (e: React.DragEvent, id: string) => void }) {
  const prob = deal.probability;
  const probColor = prob >= 70 ? 'text-green-400' : prob >= 40 ? 'text-amber-400' : 'text-red-400';
  return (
    <div draggable onDragStart={e => onDragStart(e, deal.id)} onClick={() => onEdit(deal)}
      className="bg-slate-900/80 rounded-lg border border-slate-600/50 p-3 cursor-grab hover:border-blue-500/50 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white truncate flex-1">{deal.title}</h4>
        <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
      </div>
      <p className="text-xs text-slate-400 mb-2">{deal.contactName}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-400">{formatCurrency(deal.value)}</span>
        <span className={`text-xs font-medium ${probColor}`}>{prob}%</span>
      </div>
      <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
        <div className={`h-1 rounded-full ${prob >= 70 ? 'bg-green-500' : prob >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${prob}%` }} />
      </div>
    </div>
  );
}

function DealModal({ deal, contacts, onClose, onSave }: { deal: Partial<Deal> | null; contacts: { id: string; name: string }[]; onClose: () => void; onSave: (d: Partial<Deal>) => void }) {
  const [form, setForm] = useState<Partial<Deal>>(deal || { title: '', value: 0, probability: 50, stage: 'prospect', contactId: '', contactName: '', expectedCloseDate: '', description: '', assignedTo: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{deal?.id ? 'Edit Deal' : 'New Deal'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Title</label>
            <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Value ($)</label>
              <input type="number" value={form.value || 0} onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={form.probability || 0} onChange={e => setForm({ ...form, probability: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Contact</label>
            <select value={form.contactId || ''} onChange={e => { const c = contacts.find(x => x.id === e.target.value); setForm({ ...form, contactId: e.target.value, contactName: c?.name || '' }); }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="">Select contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Stage</label>
            <select value={form.stage || 'prospect'} onChange={e => setForm({ ...form, stage: e.target.value as DealStage })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Expected Close Date</label>
            <input type="date" value={form.expectedCloseDate || ''} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Assigned To</label>
            <input value={form.assignedTo || ''} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Deals() {
  const { deals, contacts, addDeal, updateDeal, moveDeal } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Partial<Deal> | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDragStart = (_e: React.DragEvent, id: string) => setDragId(id);

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (dragId) {
      moveDeal(dragId, stage);
      setDragId(null);
    }
  };

  const handleSave = (form: Partial<Deal>) => {
    if (form.id) {
      updateDeal(form.id, form);
    } else {
      addDeal(form as Omit<Deal, 'id' | 'createdAt'>);
    }
    setShowModal(false);
    setEditDeal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Deals Pipeline</h2>
        <button onClick={() => { setEditDeal(null); setShowModal(true); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-lg flex items-center gap-2"><Plus size={16} /> New Deal</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const stageDeals = deals.filter(d => d.stage === key);
          const total = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={key} className="min-w-64 flex-shrink-0"
              onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, key)}>
              <div className={`border-t-2 ${color} bg-slate-800 rounded-xl border border-slate-700 p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                  <span className="text-xs text-slate-400">{stageDeals.length} · {formatCurrency(total)}</span>
                </div>
                <div className="space-y-2 min-h-32">
                  {stageDeals.map(d => (
                    <DealCard key={d.id} deal={d} onEdit={d => { setEditDeal(d); setShowModal(true); }} onDragStart={handleDragStart} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <DealModal
          deal={editDeal}
          contacts={contacts.map(c => ({ id: c.id, name: c.name }))}
          onClose={() => { setShowModal(false); setEditDeal(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
