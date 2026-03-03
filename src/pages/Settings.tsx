import { useState, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { formatDate } from '../lib/utils';
import { Save, Building2, Bell, Webhook, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuditEntry } from '../types';

const actionColors: Record<string, string> = {
  create: 'bg-green-500/20 text-green-300',
  update: 'bg-blue-500/20 text-blue-300',
  delete: 'bg-red-500/20 text-red-300',
  stage_change: 'bg-purple-500/20 text-purple-300',
  import: 'bg-amber-500/20 text-amber-300',
};

const entityColors: Record<string, string> = {
  contact: 'text-blue-400',
  deal: 'text-green-400',
  product: 'text-purple-400',
  invoice: 'text-amber-400',
  team: 'text-cyan-400',
  settings: 'text-slate-400',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function SettingsPage() {
  const { settings, updateSettings, auditLog } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'notifications' | 'webhooks' | 'audit'>('company');

  // Audit trail state
  const [auditFilter, setAuditFilter] = useState({ action: 'all', entity: 'all', search: '' });
  const [auditPage, setAuditPage] = useState(0);
  const AUDIT_PAGE_SIZE = 50;

  const filteredAudit = useMemo(() => {
    let entries = [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (auditFilter.action !== 'all') entries = entries.filter(e => e.action === auditFilter.action);
    if (auditFilter.entity !== 'all') entries = entries.filter(e => e.entity === auditFilter.entity);
    if (auditFilter.search) {
      const q = auditFilter.search.toLowerCase();
      entries = entries.filter(e => e.entityName.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q));
    }
    return entries;
  }, [auditLog, auditFilter]);

  const auditPages = Math.ceil(filteredAudit.length / AUDIT_PAGE_SIZE);
  const pagedAudit = filteredAudit.slice(auditPage * AUDIT_PAGE_SIZE, (auditPage + 1) * AUDIT_PAGE_SIZE);

  const [notifications, setNotifications] = useState({
    dealWon: true, dealLost: true, newContact: true, invoiceOverdue: true, weeklyReport: true, emailDigest: false,
  });

  const [webhooks] = useState([
    { id: '1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/...', events: ['deal_won', 'deal_lost'], active: true },
    { id: '2', name: 'CRM Sync', url: 'https://api.crm.com/webhook', events: ['contact_added', 'deal_updated'], active: false },
  ]);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem('enterprise-platform-store');
    window.location.reload();
  };

  const tabs = [
    { key: 'company' as const, icon: Building2, label: 'Company' },
    { key: 'audit' as const, icon: Shield, label: 'Audit Trail' },
    { key: 'notifications' as const, icon: Bell, label: 'Notifications' },
    { key: 'webhooks' as const, icon: Webhook, label: 'Webhooks' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="flex gap-2 border-b border-slate-700 pb-0">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-white'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Company Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Address</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tax Rate (%)</label>
                <input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Currency</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fiscal Year Start</label>
                <select value={form.fiscalYearStart || 'January'} onChange={e => setForm({ ...form, fiscalYearStart: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Default Payment Terms (days)</label>
              <input type="number" value={form.defaultPaymentTerms || 30} onChange={e => setForm({ ...form, defaultPaymentTerms: Number(e.target.value) })}
                className="w-full max-w-32 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
            {saved && <span className="text-sm text-green-400">Saved!</span>}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['create', 'update', 'delete', 'stage_change', 'import'] as AuditEntry['action'][]).map(action => (
              <div key={action} className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${actionColors[action]}`}>{action.replace('_', ' ')}</span>
                <p className="text-lg font-bold text-white">{auditLog.filter(e => e.action === action).length}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select value={auditFilter.action} onChange={e => { setAuditFilter({ ...auditFilter, action: e.target.value }); setAuditPage(0); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="all">All Actions</option>
              <option value="create">Create</option><option value="update">Update</option>
              <option value="delete">Delete</option><option value="stage_change">Stage Change</option>
              <option value="import">Import</option>
            </select>
            <select value={auditFilter.entity} onChange={e => { setAuditFilter({ ...auditFilter, entity: e.target.value }); setAuditPage(0); }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="all">All Entities</option>
              <option value="contact">Contacts</option><option value="deal">Deals</option>
              <option value="product">Products</option><option value="invoice">Invoices</option>
            </select>
            <input value={auditFilter.search} onChange={e => { setAuditFilter({ ...auditFilter, search: e.target.value }); setAuditPage(0); }}
              placeholder="Search entries..." className="flex-1 min-w-48 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none" />
            <span className="text-xs text-slate-500">{filteredAudit.length} entries</span>
          </div>

          {/* Audit Log Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Timestamp</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Entity</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {pagedAudit.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="px-4 py-2 text-xs text-slate-400 whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[entry.action] || 'bg-slate-500/20 text-slate-300'}`}>
                        {entry.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${entityColors[entry.entity] || 'text-slate-400'}`}>{entry.entity}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-white">{entry.entityName}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{entry.userName}</td>
                    <td className="px-4 py-2 text-xs text-slate-500 max-w-48 truncate">
                      {entry.changes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagedAudit.length === 0 && <p className="text-center text-slate-500 py-8">No audit entries match filters</p>}
          </div>

          {/* Pagination */}
          {auditPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Page {auditPage + 1} of {auditPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setAuditPage(p => Math.max(0, p - 1))} disabled={auditPage === 0}
                  className="p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <button onClick={() => setAuditPage(p => Math.min(auditPages - 1, p + 1))} disabled={auditPage >= auditPages - 1}
                  className="p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, enabled]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900/80">
                <span className="text-sm text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <input type="checkbox" checked={enabled} onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })} className="sr-only" />
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Integration Webhooks</h3>
          <div className="space-y-4">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{wh.name}</h4>
                  <span className={`text-xs font-medium ${wh.active ? 'text-green-400' : 'text-slate-400'}`}>{wh.active ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-2 truncate">{wh.url}</p>
                <div className="flex gap-1 flex-wrap">
                  {wh.events.map(ev => (
                    <span key={ev} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{ev}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 rounded-lg">+ Add Webhook</button>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-slate-800 rounded-xl border border-red-500/30 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-400 mb-4">Reset all data to initial sample data. This cannot be undone.</p>
        <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium flex items-center gap-2">
          <RotateCcw size={16} /> Reset All Data
        </button>
      </div>
    </div>
  );
}
