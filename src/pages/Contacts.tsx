import { useState, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { formatDate, formatDateTime, getInitials } from '../lib/utils';
import { Plus, Search, Edit2, Trash2, X, Download, Upload, Eye, Phone, Mail, Calendar, StickyNote, Zap } from 'lucide-react';
import { Contact } from '../types';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400 bg-green-500/20' : score >= 50 ? 'text-amber-400 bg-amber-500/20' : 'text-red-400 bg-red-500/20';
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score}</span>;
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    Referral: 'bg-green-500/20 text-green-300', LinkedIn: 'bg-blue-500/20 text-blue-300', Website: 'bg-purple-500/20 text-purple-300',
    Conference: 'bg-amber-500/20 text-amber-300', Partner: 'bg-cyan-500/20 text-cyan-300', Webinar: 'bg-pink-500/20 text-pink-300',
    'Cold Outreach': 'bg-slate-500/20 text-slate-300',
  };
  return <span className={`px-1.5 py-0.5 rounded text-xs ${colors[source] || 'bg-slate-500/20 text-slate-300'}`}>{source}</span>;
}

function ContactTimeline({ contactId, activities }: { contactId: string; activities: { id: string; type: string; description: string; userName: string; timestamp: string; relatedId?: string; relatedType?: string }[] }) {
  const contactActivities = activities.filter(a => a.relatedId === contactId);
  const iconMap: Record<string, typeof Phone> = { call: Phone, email: Mail, meeting: Calendar, note: StickyNote, contact_added: Zap };
  if (contactActivities.length === 0) return <p className="text-sm text-slate-500 py-4 text-center">No activity history yet</p>;
  return (
    <div className="space-y-3">
      {contactActivities.map(a => {
        const Icon = iconMap[a.type] || StickyNote;
        return (
          <div key={a.id} className="flex items-start gap-3 pl-2 border-l-2 border-slate-600 ml-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 -ml-5">
              <Icon size={12} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm text-slate-300">{a.description}</p>
              <p className="text-xs text-slate-500">{a.userName} · {formatDateTime(a.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CSVImportModal({ onClose, onImport }: { onClose: () => void; onImport: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Omit<Contact, 'id' | 'createdAt'>[]>([]);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { setError('CSV must have a header row and at least one data row'); return; }
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      const nameIdx = headers.indexOf('name');
      const emailIdx = headers.indexOf('email');
      if (nameIdx === -1 || emailIdx === -1) { setError('CSV must have "name" and "email" columns'); return; }
      const parsed: Omit<Contact, 'id' | 'createdAt'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (!cols[nameIdx]) continue;
        parsed.push({
          name: cols[nameIdx], email: cols[emailIdx] || '', phone: cols[headers.indexOf('phone')] || '',
          company: cols[headers.indexOf('company')] || '', title: cols[headers.indexOf('title')] || '',
          tags: (cols[headers.indexOf('tags')] || '').split(';').filter(Boolean), notes: '',
          status: 'lead', lastContact: new Date().toISOString().slice(0, 10), score: 50, source: 'CSV Import',
        });
      }
      setPreview(parsed);
      setError('');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Import Contacts from CSV</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-400">Upload a CSV file with columns: name, email, phone, company, title, tags (semicolon-separated)</p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {preview.length > 0 && (
            <div>
              <p className="text-sm text-green-400 mb-2">{preview.length} contacts ready to import</p>
              <div className="max-h-40 overflow-auto bg-slate-900 rounded-lg p-3 space-y-1">
                {preview.slice(0, 5).map((c, i) => (
                  <p key={i} className="text-xs text-slate-300">{c.name} - {c.email} ({c.company})</p>
                ))}
                {preview.length > 5 && <p className="text-xs text-slate-500">...and {preview.length - 5} more</p>}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
          <button onClick={() => { onImport(preview); onClose(); }} disabled={preview.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium">Import {preview.length} Contacts</button>
        </div>
      </div>
    </div>
  );
}

function ContactModal({ contact, onClose, onSave }: { contact: Partial<Contact> | null; onClose: () => void; onSave: (c: Partial<Contact>) => void }) {
  const [form, setForm] = useState<Partial<Contact>>(contact || { name: '', email: '', phone: '', company: '', title: '', tags: [], notes: '', status: 'lead', lastContact: new Date().toISOString().slice(0, 10), score: 50, source: 'Website' });
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Contact['status'] })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Source</label>
              <select value={form.source || 'Website'} onChange={e => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                <option>Website</option><option>Referral</option><option>LinkedIn</option><option>Conference</option><option>Partner</option><option>Webinar</option><option>Cold Outreach</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Engagement Score (0-100)</label>
            <input type="number" min={0} max={100} value={form.score || 50} onChange={e => setForm({ ...form, score: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
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

function ContactDetailDrawer({ contact, activities, onClose }: { contact: Contact; activities: { id: string; type: string; description: string; userName: string; timestamp: string; relatedId?: string; relatedType?: string }[]; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'timeline'>('details');
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md bg-slate-800 border-l border-slate-700 h-full overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="flex border-b border-slate-700">
          {(['details', 'timeline'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-white'}`}>{t === 'details' ? 'Details' : 'Timeline'}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'details' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">{getInitials(contact.name)}</div>
                <div>
                  <p className="text-white font-semibold">{contact.name}</p>
                  <p className="text-sm text-slate-400">{contact.title} at {contact.company}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ScoreBadge score={contact.score || 0} />
                    <SourceBadge source={contact.source || ''} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3"><p className="text-xs text-slate-400">Email</p><p className="text-sm text-white truncate">{contact.email}</p></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><p className="text-xs text-slate-400">Phone</p><p className="text-sm text-white">{contact.phone}</p></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><p className="text-xs text-slate-400">Status</p><p className="text-sm text-white capitalize">{contact.status}</p></div>
                <div className="bg-slate-900/50 rounded-lg p-3"><p className="text-xs text-slate-400">Last Contact</p><p className="text-sm text-white">{formatDate(contact.lastContact)}</p></div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Engagement Score</p>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className={`h-3 rounded-full ${(contact.score || 0) >= 80 ? 'bg-green-500' : (contact.score || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${contact.score || 0}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">{contact.tags.map(t => <span key={t} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{t}</span>)}</div>
              </div>
              {contact.notes && <div><p className="text-xs text-slate-400 mb-1">Notes</p><p className="text-sm text-slate-300">{contact.notes}</p></div>}
            </div>
          ) : (
            <ContactTimeline contactId={contact.id} activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const { contacts, activities, addContact, updateContact, deleteContact, importContacts } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editContact, setEditContact] = useState<Partial<Contact> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (form: Partial<Contact>) => {
    if (form.id) updateContact(form.id, form);
    else addContact(form as Omit<Contact, 'id' | 'createdAt'>);
    setShowModal(false);
    setEditContact(null);
  };

  const handleExportCSV = () => {
    const headers = 'Name,Email,Phone,Company,Title,Status,Tags,Score,Source\n';
    const rows = contacts.map(c => `"${c.name}","${c.email}","${c.phone}","${c.company}","${c.title}","${c.status}","${c.tags.join('; ')}","${c.score || 0}","${c.source || ''}"`).join('\n');
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
          <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 rounded-lg flex items-center gap-2"><Upload size={16} /> Import CSV</button>
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
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Score</th>
                <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Source</th>
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
                  <td className="px-4 py-3"><ScoreBadge score={c.score || 0} /></td>
                  <td className="px-4 py-3"><SourceBadge source={c.source || ''} /></td>
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
                      <button onClick={() => setSelectedContact(c)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded" title="View Details"><Eye size={14} /></button>
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
      {showImport && <CSVImportModal onClose={() => setShowImport(false)} onImport={importContacts} />}
      {selectedContact && <ContactDetailDrawer contact={selectedContact} activities={activities} onClose={() => setSelectedContact(null)} />}
    </div>
  );
}
