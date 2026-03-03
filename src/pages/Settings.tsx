import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { Save, Building2, Bell, Webhook, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'notifications' | 'webhooks'>('company');

  const [notifications, setNotifications] = useState({
    dealWon: true, dealLost: true, newContact: true, invoiceOverdue: true, weeklyReport: true, emailDigest: false,
  });

  const [webhooks, setWebhooks] = useState([
    { id: '1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/...', events: ['deal_won', 'deal_lost'], active: true },
    { id: '2', name: 'CRM Sync', url: 'https://api.crm.com/webhook', events: ['contact_added', 'deal_updated'], active: false },
  ]);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const store = useStore.getState();
    localStorage.removeItem('enterprise-platform-store');
    window.location.reload();
  };

  const tabs = [
    { key: 'company' as const, icon: Building2, label: 'Company' },
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
            <div className="grid grid-cols-2 gap-4">
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
