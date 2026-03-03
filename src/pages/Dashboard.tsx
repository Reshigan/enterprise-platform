import { useStore } from '../stores/useStore';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { DollarSign, Target, TrendingUp, Users, Phone, Mail, Calendar, FileText, Trophy, XCircle, UserPlus, StickyNote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const STAGE_COLORS: Record<string, string> = {
  prospect: '#64748b', qualified: '#3b82f6', proposal: '#f59e0b', negotiation: '#8b5cf6', closed_won: '#22c55e', closed_lost: '#ef4444',
};

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone, email: Mail, meeting: Calendar, note: StickyNote, deal_won: Trophy, deal_lost: XCircle, invoice_sent: FileText, contact_added: UserPlus,
};

export default function Dashboard() {
  const { deals, contacts, activities, team } = useStore();

  const totalRevenue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0);
  const pipelineValue = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
  const conversionRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0;
  const avgDealSize = activeDeals > 0 ? pipelineValue / activeDeals : 0;

  const funnelData = [
    { name: 'Prospect', value: deals.filter(d => d.stage === 'prospect').length, fill: STAGE_COLORS.prospect },
    { name: 'Qualified', value: deals.filter(d => d.stage === 'qualified').length, fill: STAGE_COLORS.qualified },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length, fill: STAGE_COLORS.proposal },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length, fill: STAGE_COLORS.negotiation },
    { name: 'Won', value: deals.filter(d => d.stage === 'closed_won').length, fill: STAGE_COLORS.closed_won },
    { name: 'Lost', value: deals.filter(d => d.stage === 'closed_lost').length, fill: STAGE_COLORS.closed_lost },
  ];

  const teamPerformance = team.filter(t => t.role !== 'admin').map(t => ({
    name: t.name.split(' ')[0],
    revenue: t.revenue / 1000,
    deals: t.dealsWon,
  }));

  const revenueMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => ({
    month: m, revenue: [45, 62, 78, 95, 110, totalRevenue / 1000 || 120][i],
  }));

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Deal Size', value: formatCurrency(avgDealSize), icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Active Deals', value: String(activeDeals), icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Total Contacts', value: String(contacts.length), icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueMonths}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={funnelData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Team Performance */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Team Performance ($K Revenue)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-56 overflow-auto">
            {activities.slice(0, 8).map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || StickyNote;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300 truncate">{a.description}</p>
                    <p className="text-xs text-slate-500">{a.userName} · {formatDateTime(a.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
