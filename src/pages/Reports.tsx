import { useState, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency } from '../lib/utils';
import { Calendar, Download, Trophy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function Reports() {
  const { deals, contacts, team, invoices, activities } = useStore();
  const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2026-12-31' });

  const filteredDeals = useMemo(() =>
    deals.filter(d => d.createdAt >= dateRange.from && d.createdAt <= dateRange.to),
    [deals, dateRange]
  );

  // Win/Loss Analysis
  const wonDeals = filteredDeals.filter(d => d.stage === 'closed_won');
  const lostDeals = filteredDeals.filter(d => d.stage === 'closed_lost');
  const activeDeals = filteredDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
  const winRate = (wonDeals.length + lostDeals.length) > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0;

  const wonRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const lostRevenue = lostDeals.reduce((s, d) => s + d.value, 0);
  const pipelineRevenue = activeDeals.reduce((s, d) => s + d.value, 0);

  // Sales Forecasting (weighted by probability)
  const forecast = activeDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);

  // Rep Leaderboard
  const leaderboard = team
    .filter(t => t.role !== 'admin')
    .map(t => {
      const repDeals = filteredDeals.filter(d => d.assignedTo === t.name);
      const repWon = repDeals.filter(d => d.stage === 'closed_won');
      const repRevenue = repWon.reduce((s, d) => s + d.value, 0);
      return { ...t, repDeals: repDeals.length, repWon: repWon.length, repRevenue };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((name, i) => {
      const monthStr = `2026-${String(i + 1).padStart(2, '0')}`;
      const monthDeals = filteredDeals.filter(d => d.createdAt.startsWith(monthStr));
      return {
        month: name,
        won: monthDeals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0) / 1000,
        lost: monthDeals.filter(d => d.stage === 'closed_lost').reduce((s, d) => s + d.value, 0) / 1000,
        pipeline: monthDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0) / 1000,
      };
    });
  }, [filteredDeals]);

  // Stage distribution
  const stageData = [
    { name: 'Prospect', value: filteredDeals.filter(d => d.stage === 'prospect').length, color: '#64748b' },
    { name: 'Qualified', value: filteredDeals.filter(d => d.stage === 'qualified').length, color: '#3b82f6' },
    { name: 'Proposal', value: filteredDeals.filter(d => d.stage === 'proposal').length, color: '#f59e0b' },
    { name: 'Negotiation', value: filteredDeals.filter(d => d.stage === 'negotiation').length, color: '#8b5cf6' },
    { name: 'Won', value: wonDeals.length, color: '#22c55e' },
    { name: 'Lost', value: lostDeals.length, color: '#ef4444' },
  ];

  const handleExport = () => {
    const data = {
      summary: { wonRevenue, lostRevenue, pipelineRevenue, forecast, winRate },
      leaderboard: leaderboard.map(l => ({ name: l.name, revenue: l.revenue, dealsWon: l.dealsWon })),
      deals: filteredDeals.map(d => ({ title: d.title, value: d.value, stage: d.stage, contact: d.contactName })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sales-report.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="bg-transparent text-sm text-white focus:outline-none" />
            <span className="text-slate-500">to</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="bg-transparent text-sm text-white focus:outline-none" />
          </div>
          <button onClick={handleExport} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 rounded-lg flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-400" /><span className="text-xs text-slate-400">Won Revenue</span></div>
          <p className="text-xl font-bold text-green-400">{formatCurrency(wonRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-red-400" /><span className="text-xs text-slate-400">Lost Revenue</span></div>
          <p className="text-xl font-bold text-red-400">{formatCurrency(lostRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Target size={16} className="text-blue-400" /><span className="text-xs text-slate-400">Pipeline</span></div>
          <p className="text-xl font-bold text-blue-400">{formatCurrency(pipelineRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-purple-400" /><span className="text-xs text-slate-400">Forecast</span></div>
          <p className="text-xl font-bold text-purple-400">{formatCurrency(forecast)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2"><Trophy size={16} className="text-amber-400" /><span className="text-xs text-slate-400">Win Rate</span></div>
          <p className="text-xl font-bold text-amber-400">{winRate}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Month ($K)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Legend />
              <Bar dataKey="won" fill="#22c55e" radius={[4, 4, 0, 0]} name="Won" />
              <Bar dataKey="pipeline" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pipeline" />
              <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Lost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Deal Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stageData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                {stageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rep Leaderboard */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Sales Rep Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((rep, idx) => (
            <div key={rep.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : 'bg-orange-500/20 text-orange-400'}`}>
                #{idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{rep.name}</p>
                <p className="text-xs text-slate-400">{rep.dealsWon} deals won · {rep.activitiesCount} activities</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">{formatCurrency(rep.revenue)}</p>
                <p className="text-xs text-slate-400">revenue</p>
              </div>
              <div className="w-32">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${leaderboard[0] ? Math.round(rep.revenue / leaderboard[0].revenue * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
