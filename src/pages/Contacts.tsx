import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { formatDate, getInitials } from '../lib/utils';
import { Plus, Search, Edit2, Trash2, X, Tag, Download, Upload } from 'lucide-react';
import { Contact } from '../types';

function ContactModal({ contact, onClose, onSave }: { contact: Partial<Contact> | null; onClose: () => void; onSave: (c: Partial<Contact>) => void }) {
  const [form, setForm] = useState<Partial<Contact>>(contact || { name: '', email: '', phone: '', company: '', title: '', tags: [], notes: '', status: 'lead', lastContact: new Date().toISOString().slice(0, 10) });
  const [tagInput, setTagInput] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{contact?.id ? 'Edit Contact' : 'New Contact'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {(['name', 'email', 'phone', 'company', 'title'] as const).map(field => (
            <div key={field}>
              <label className="block text-xs text-slate-400 mb-1 capitalize">{field}</label>
              <input value={(form[field] as string) || ''} onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Contact['status'] })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {(form.tags || []).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs flex items-center gap-1">
                  {tag}
                  <button onClick={() => setForm({ ...form, tags: form.tags?.filter(t => t !== tag) })} className="hover:text-white"><X size={10} /></button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag + Enter"
              onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] }); setTagInput(''); } }}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
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

export default function Contacts() {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editContact, setEditContact] = useState<Partial<Contact> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (form: Partial<Contact>) => {
    if (form.id) {
      updateContact(form.id, form);
    } else {
      addContact(form as Omit<Contact, 'id' | 'createdAt'>);
    }
    setShowModal(false);
    setEditContact(null);
  };

  const handleExportCSV = () => {
    const headers = 'Name,Email,Phone,Company,Title,Status,Tags\n';
    const rows = contacts.map(c => `"${c.name}","${c.email}","${c.phone}","${c.company}","${c.title}","${c.status}","${c.tags.join(', ')}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'contacts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = { active: 'bg-green-500/20 text-green-400', lead: 'bg-blue-500/20 text-blue-400', inactive: 'bg-slate-500/20 text-slate-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Contacts</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 rounded-lg flex items-center gap-2"><Download size={16} /> Export</button>
          <button onClick={() => { setEditContact(null); setShowModal(true); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-sm text-white rounded-lg flex items-center gap-2"><Plus size={16} /> Add Contact</button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="lead">Lead</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Tags</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Last Contact</th>
                <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(c.name)}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-300">{c.company}</p>
                    <p className="text-xs text-slate-500">{c.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.slice(0, 2).map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{t}</span>
                      ))}
                      {c.tags.length > 2 && <span className="text-xs text-slate-500">+{c.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{formatDate(c.lastContact)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditContact(c); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Edit2 size={14} /></button>
                      <button onClick={() => deleteContact(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center text-slate-500 py-12">No contacts found</p>}
      </div>
      <p className="text-xs text-slate-500">{filtered.length} of {contacts.length} contacts</p>

      {showModal && <ContactModal contact={editContact} onClose={() => { setShowModal(false); setEditContact(null); }} onSave={handleSave} />}
    </div>
  );
}
