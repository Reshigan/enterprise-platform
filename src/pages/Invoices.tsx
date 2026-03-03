import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency, formatDate } from '../lib/utils';
import { Plus, X, Eye, Trash2, Send, CheckCircle } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';

function InvoicePreview({ invoice, settings, onClose }: { invoice: Invoice; settings: { name: string; email: string; address: string; taxRate: number }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto text-gray-900">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{settings.name}</h2>
              <p className="text-sm text-gray-500">{settings.email}</p>
              <p className="text-sm text-gray-500">{settings.address}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
              <p className="text-sm text-gray-600">{invoice.number}</p>
              <p className="text-sm text-gray-500">Date: {formatDate(invoice.issueDate)}</p>
              <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700">Bill To:</p>
            <p className="text-sm text-gray-900 font-semibold">{invoice.contactName}</p>
          </div>
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-600 py-2">Description</th>
                <th className="text-right text-xs font-semibold text-gray-600 py-2">Qty</th>
                <th className="text-right text-xs font-semibold text-gray-600 py-2">Unit Price</th>
                <th className="text-right text-xs font-semibold text-gray-600 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 text-sm">{item.description}</td>
                  <td className="py-2 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tax ({settings.taxRate}%)</span><span>{formatCurrency(invoice.tax)}</span></div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">Close</button>
        </div>
      </div>
    </div>
  );
}

function InvoiceModal({ invoice, contacts, deals, taxRate, onClose, onSave }: {
  invoice: Partial<Invoice> | null; contacts: { id: string; name: string }[]; deals: { id: string; title: string; value: number; contactId: string }[];
  taxRate: number; onClose: () => void; onSave: (inv: Partial<Invoice>) => void;
}) {
  const [form, setForm] = useState<Partial<Invoice>>(invoice || {
    dealId: '', contactId: '', contactName: '', items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0, tax: 0, total: 0, status: 'draft', issueDate: new Date().toISOString().slice(0, 10), dueDate: '',
  });

  const recalc = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = Math.round(subtotal * taxRate / 100);
    return { items, subtotal, tax, total: subtotal + tax };
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    const items = [...(form.items || [])];
    const item = { ...items[idx], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }
    items[idx] = item;
    setForm({ ...form, ...recalc(items) });
  };

  const addItem = () => {
    const items = [...(form.items || []), { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0, total: 0 }];
    setForm({ ...form, items });
  };

  const removeItem = (idx: number) => {
    const items = (form.items || []).filter((_, i) => i !== idx);
    setForm({ ...form, ...recalc(items) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{invoice?.id ? 'Edit Invoice' : 'New Invoice'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Deal</label>
              <select value={form.dealId || ''} onChange={e => {
                const d = deals.find(x => x.id === e.target.value);
                const c = contacts.find(x => x.id === d?.contactId);
                setForm({ ...form, dealId: e.target.value, contactId: d?.contactId || '', contactName: c?.name || '' });
              }} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select deal</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.title} ({formatCurrency(d.value)})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value as Invoice['status'] })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Issue Date</label>
              <input type="date" value={form.issueDate || ''} onChange={e => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Due Date</label>
              <input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Line Items</label>
            {(form.items || []).map((item, idx) => (
              <div key={item.id} className="flex gap-2 mb-2">
                <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
                <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} placeholder="Qty"
                  className="w-16 px-2 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white text-center focus:border-blue-500 focus:outline-none" />
                <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} placeholder="Price"
                  className="w-24 px-2 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white text-right focus:border-blue-500 focus:outline-none" />
                <span className="w-24 px-2 py-2 text-sm text-slate-300 text-right">{formatCurrency(item.total)}</span>
                <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-400"><X size={16} /></button>
              </div>
            ))}
            <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300">+ Add item</button>
          </div>

          <div className="flex justify-end">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-white">{formatCurrency(form.subtotal || 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tax ({taxRate}%)</span><span className="text-white">{formatCurrency(form.tax || 0)}</span></div>
              <div className="flex justify-between font-bold border-t border-slate-600 pt-1"><span className="text-white">Total</span><span className="text-blue-400">{formatCurrency(form.total || 0)}</span></div>
            </div>
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

const statusColors: Record<string, string> = { draft: 'bg-slate-500/20 text-slate-300', sent: 'bg-blue-500/20 text-blue-300', paid: 'bg-green-500/20 text-green-300', overdue: 'bg-red-500/20 text-red-300' };

export default function Invoices() {
  const { invoices, contacts, deals, settings, addInvoice, updateInvoice, deleteInvoice } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Partial<Invoice> | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const handleSave = (form: Partial<Invoice>) => {
    if (form.id) updateInvoice(form.id, form);
    else addInvoice(form as Omit<Invoice, 'id' | 'number'>);
    setShowModal(false);
    setEditInvoice(null);
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Invoices</h2>
        <button onClick={() => { setEditInvoice(null); setShowModal(true); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Create Invoice</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Paid</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Pending</p>
          <p className="text-xl font-bold text-blue-400">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Overdue</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Invoice</th>
              <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Client</th>
              <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Date</th>
              <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Due</th>
              <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Total</th>
              <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3 text-sm font-medium text-white">{inv.number}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{inv.contactName}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(inv.issueDate)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status]}`}>{inv.status}</span></td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-blue-400">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setPreviewInvoice(inv)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded" title="Preview"><Eye size={14} /></button>
                    {inv.status === 'draft' && (
                      <button onClick={() => updateInvoice(inv.id, { status: 'sent' })} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded" title="Send"><Send size={14} /></button>
                    )}
                    {inv.status === 'sent' && (
                      <button onClick={() => updateInvoice(inv.id, { status: 'paid' })} className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded" title="Mark Paid"><CheckCircle size={14} /></button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="text-center text-slate-500 py-12">No invoices yet</p>}
      </div>

      {showModal && (
        <InvoiceModal invoice={editInvoice} contacts={contacts.map(c => ({ id: c.id, name: c.name }))}
          deals={deals.map(d => ({ id: d.id, title: d.title, value: d.value, contactId: d.contactId }))}
          taxRate={settings.taxRate} onClose={() => { setShowModal(false); setEditInvoice(null); }} onSave={handleSave} />
      )}
      {previewInvoice && <InvoicePreview invoice={previewInvoice} settings={settings} onClose={() => setPreviewInvoice(null)} />}
    </div>
  );
}
