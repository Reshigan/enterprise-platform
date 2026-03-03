import { useState, useMemo } from 'react';
import { useStore } from '../stores/useStore';
import { formatCurrency } from '../lib/utils';
import { Calendar, Download, Trophy, TrendingUp, TrendingDown, Target, AlertTriangle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { DealStage } from '../types';

export default function Reports() {
  const { deals, team } = useStore();
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

  // Pipeline Velocity Analysis by Stage
  const velocityByStage = useMemo(() => {
    const stageKeys: DealStage[] = ['prospect', 'qualified', 'proposal', 'negotiation'];
    return stageKeys.map(stageKey => {
      const changes = deals.flatMap(d => d.stageHistory).filter(h => h.from === stageKey);
      const avgDays = changes.length > 0 ? Math.round(changes.reduce((s, h) => s + h.daysInStage, 0) / changes.length) : 0;
      const isBottleneck = avgDays > 20;
      return { stage: stageKey.charAt(0).toUpperCase() + stageKey.slice(1), avgDays, count: changes.length, isBottleneck };
    });
  }, [deals]);

  // Sales cycle distribution
  const cycleData = useMemo(() => {
    const completedDeals = deals.filter(d => d.stage === 'closed_won' && d.stageHistory.length > 0);
    const buckets = [
      { label: '0-30d', min: 0, max: 30, count: 0 },
      { label: '31-60d', min: 31, max: 60, count: 0 },
      { label: '61-90d', min: 61, max: 90, count: 0 },
      { label: '90+d', min: 91, max: Infinity, count: 0 },
    ];
    completedDeals.forEach(d => {
      const totalDays = d.stageHistory.reduce((s, h) => s + h.daysInStage, 0);
      const bucket = buckets.find(b => totalDays >= b.min && totalDays <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [deals]);

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

  // Deal score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: '0-25', min: 0, max: 25, count: 0, color: '#ef4444' },
      { label: '26-50', min: 26, max: 50, count: 0, color: '#f59e0b' },
      { label: '51-75', min: 51, max: 75, count: 0, color: '#3b82f6' },
      { label: '76-100', min: 76, max: 100, count: 0, color: '#22c55e' },
    ];
    filteredDeals.forEach(d => {
      const bucket = buckets.find(b => d.score >= b.min && d.score <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [filteredDeals]);

  const handleExport = () => {
    const data = {
      summary: { wonRevenue, lostRevenue, pipelineRevenue, forecast, winRate },
      velocityByStage,
      leaderboard: leaderboard.map(l => ({ name: l.name, revenue: l.revenue, dealsWon: l.dealsWon })),
      deals: filteredDeals.map(d => ({ title: d.title, value: d.value, stage: d.stage, contact: d.contactName, score: d.score })),
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

      {/* Pipeline Velocity Analysis */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Pipeline Velocity Analysis</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {velocityByStage.map(v => (
            <div key={v.stage} className={`p-4 rounded-lg border ${v.isBottleneck ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{v.stage}</span>
                {v.isBottleneck && <AlertTriangle size={14} className="text-amber-400" />}
              </div>
              <p className={`text-2xl font-bold ${v.isBottleneck ? 'text-amber-400' : 'text-white'}`}>{v.avgDays}<span className="text-xs text-slate-500 ml-1">days</span></p>
              <p className="text-xs text-slate-500">{v.count} transitions</p>
              {v.isBottleneck && <p className="text-xs text-amber-400 mt-1">Bottleneck detected</p>}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={velocityByStage}>
            <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Bar dataKey="avgDays" name="Avg Days">
              {velocityByStage.map((v, i) => (
                <Cell key={i} fill={v.isBottleneck ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
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

      {/* Score Distribution + Sales Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Deal Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistribution}>
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" name="Deals">
                {scoreDistribution.map((b, i) => <Cell key={i} fill={b.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Sales Cycle Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cycleData}>
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Deals" />
            </BarChart>
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
                <p className="text-xs text-slate-400">{rep.quotaAttainment}% of quota</p>
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
