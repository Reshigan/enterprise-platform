import { useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { DollarSign, Target, TrendingUp, Users, Phone, Mail, Calendar, FileText, Trophy, XCircle, UserPlus, StickyNote, Zap, Clock, BarChart3, Activity as ActivityIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';

const STAGE_COLORS: Record<string, string> = {
  prospect: '#64748b', qualified: '#3b82f6', proposal: '#f59e0b', negotiation: '#8b5cf6', closed_won: '#22c55e', closed_lost: '#ef4444',
};

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone, email: Mail, meeting: Calendar, note: StickyNote, deal_won: Trophy, deal_lost: XCircle, invoice_sent: FileText, contact_added: UserPlus, stage_change: Zap, task: Clock,
};

function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#spark-${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const { deals, contacts, activities, team, invoices } = useStore();

  const totalRevenue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0);
  const pipelineValue = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
  const conversionRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0;
  const avgDealSize = activeDeals.length > 0 ? pipelineValue / activeDeals.length : 0;
  const weightedPipeline = activeDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);

  // Pipeline velocity
  const allStageChanges = deals.flatMap(d => d.stageHistory);
  const avgDaysPerStage = allStageChanges.length > 0 ? Math.round(allStageChanges.reduce((s, h) => s + h.daysInStage, 0) / allStageChanges.length) : 0;

  // Deal score distribution
  const dealScores = useMemo(() => {
    const buckets = [
      { range: '0-25', count: 0, color: '#ef4444' },
      { range: '26-50', count: 0, color: '#f59e0b' },
      { range: '51-75', count: 0, color: '#3b82f6' },
      { range: '76-100', count: 0, color: '#22c55e' },
    ];
    activeDeals.forEach(d => {
      const score = d.score || 0;
      if (score <= 25) buckets[0].count++;
      else if (score <= 50) buckets[1].count++;
      else if (score <= 75) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [activeDeals]);

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
    quota: t.quota / 1000,
  }));

  const revenueMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => ({
    month: m, revenue: [45, 62, 78, 95, 110, totalRevenue / 1000 || 120][i],
  }));

  // Sparkline data
  const revenueTrend = [30, 45, 42, 62, 55, 78, 72, 95, 88, 110, 105, totalRevenue / 1000 || 120];
  const pipelineTrend = [300, 350, 420, 380, 450, 500, 480, 520, 490, 550, pipelineValue / 1000, pipelineValue / 1000];
  const contactsTrend = [4, 5, 6, 5, 7, 8, 7, 8, 9, 8, contacts.length, contacts.length];
  const dealsTrend = [3, 4, 5, 4, 6, 5, 7, 6, 8, 7, activeDeals.length, activeDeals.length];

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', sparkData: revenueTrend, sparkColor: '#22c55e' },
    { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', sparkData: pipelineTrend, sparkColor: '#3b82f6' },
    { label: 'Weighted Pipeline', value: formatCurrency(weightedPipeline), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', sparkData: dealsTrend, sparkColor: '#8b5cf6' },
    { label: 'Avg Deal Size', value: formatCurrency(avgDealSize), icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', sparkData: revenueTrend, sparkColor: '#f59e0b' },
    { label: 'Active Deals', value: String(activeDeals.length), icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10', sparkData: dealsTrend, sparkColor: '#06b6d4' },
    { label: 'Total Contacts', value: String(contacts.length), icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', sparkData: contactsTrend, sparkColor: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, sparkData, sparkColor }) => (
          <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className={`text-lg font-bold ${color} mb-1`}>{value}</p>
            <Sparkline data={sparkData} color={sparkColor} height={32} />
          </div>
        ))}
      </div>

      {/* Pipeline Velocity + Deal Score Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Pipeline Velocity</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Avg Days per Stage</p>
              <p className="text-2xl font-bold text-amber-400">{avgDaysPerStage}<span className="text-sm text-slate-500 ml-1">days</span></p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-400">{conversionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Win Rate</p>
              <p className="text-lg font-bold text-blue-400">
                {deals.filter(d => d.stage === 'closed_won').length}/{deals.filter(d => ['closed_won', 'closed_lost'].includes(d.stage)).length} deals
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Deal Score Distribution</h3>
          </div>
          <div className="space-y-2">
            {dealScores.map(bucket => (
              <div key={bucket.range} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-12">{bucket.range}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${activeDeals.length > 0 ? (bucket.count / activeDeals.length) * 100 : 0}%`, backgroundColor: bucket.color }} />
                </div>
                <span className="text-xs text-slate-300 w-6 text-right">{bucket.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Score based on value, probability & velocity</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ActivityIcon size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Invoices Paid</span>
              <span className="text-sm font-bold text-green-400">{formatCurrency(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Invoices Overdue</span>
              <span className="text-sm font-bold text-red-400">{formatCurrency(invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Top Contact Score</span>
              <span className="text-sm font-bold text-blue-400">{Math.max(...contacts.map(c => c.score || 0))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Avg Contact Score</span>
              <span className="text-sm font-bold text-slate-300">{contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + (c.score || 0), 0) / contacts.length) : 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Activities Today</span>
              <span className="text-sm font-bold text-purple-400">{activities.filter(a => a.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Team: Revenue vs Quota ($K)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue ($K)" />
              <Bar dataKey="quota" fill="#334155" radius={[4, 4, 0, 0]} name="Quota ($K)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-56 overflow-auto">
            {activities.slice(0, 10).map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || StickyNote;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300 truncate">{a.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500">{a.userName} · {formatDateTime(a.timestamp)}</p>
                      {a.relatedType && <span className="text-xs px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">{a.relatedType}</span>}
                    </div>
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
