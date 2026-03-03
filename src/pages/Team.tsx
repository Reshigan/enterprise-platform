import { useStore } from '../stores/useStore';
import { formatCurrency, getInitials } from '../lib/utils';
import { Trophy, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const roleColors: Record<string, string> = { admin: 'bg-red-500/20 text-red-300', manager: 'bg-purple-500/20 text-purple-300', rep: 'bg-blue-500/20 text-blue-300' };

const COMMISSION_TIERS = [
  { min: 0, max: 100000, rate: 5 },
  { min: 100000, max: 300000, rate: 7 },
  { min: 300000, max: 500000, rate: 8 },
  { min: 500000, max: Infinity, rate: 10 },
];

function calcCommission(revenue: number): { tier: string; rate: number; earned: number } {
  let earned = 0;
  let tier = '';
  let rate = 0;
  for (const t of COMMISSION_TIERS) {
    if (revenue > t.min) {
      const applicable = Math.min(revenue, t.max) - t.min;
      earned += applicable * t.rate / 100;
      tier = `${t.rate}%`;
      rate = t.rate;
    }
  }
  return { tier, rate, earned: Math.round(earned) };
}

export default function Team() {
  const { team } = useStore();

  const reps = team.filter(t => t.role !== 'admin');

  const performanceData = reps.map(t => ({
    name: t.name.split(' ')[0],
    revenue: Math.round(t.revenue / 1000),
    quota: Math.round(t.quota / 1000),
    deals: t.dealsWon,
  }));

  const totalRevenue = team.reduce((s, t) => s + t.revenue, 0);
  const totalDeals = team.reduce((s, t) => s + t.dealsWon, 0);
  const totalCommissions = team.reduce((s, t) => s + calcCommission(t.revenue).earned, 0);
  const avgQuotaAttainment = reps.length > 0 ? Math.round(reps.reduce((s, t) => s + t.quotaAttainment, 0) / reps.length) : 0;
  const avgDealCycle = reps.length > 0 ? Math.round(reps.reduce((s, t) => s + t.avgDealCycle, 0) / reps.length) : 0;

  // Leaderboard sorted by revenue
  const leaderboard = [...reps].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Team Management</h2>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2"><Trophy size={20} className="text-blue-400" /></div>
          <p className="text-xs text-slate-400">Team Members</p>
          <p className="text-xl font-bold text-white">{team.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-2"><DollarSign size={20} className="text-green-400" /></div>
          <p className="text-xs text-slate-400">Total Revenue</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2"><TrendingUp size={20} className="text-purple-400" /></div>
          <p className="text-xs text-slate-400">Total Deals Won</p>
          <p className="text-xl font-bold text-purple-400">{totalDeals}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2"><Target size={20} className="text-amber-400" /></div>
          <p className="text-xs text-slate-400">Avg Quota Attainment</p>
          <p className={`text-xl font-bold ${avgQuotaAttainment >= 100 ? 'text-green-400' : avgQuotaAttainment >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{avgQuotaAttainment}%</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-2"><Clock size={20} className="text-cyan-400" /></div>
          <p className="text-xs text-slate-400">Avg Deal Cycle</p>
          <p className="text-xl font-bold text-cyan-400">{avgDealCycle}<span className="text-xs text-slate-500 ml-1">days</span></p>
        </div>
      </div>

      {/* Revenue vs Quota Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Revenue vs Quota ($K)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($K)" />
            <Bar dataKey="quota" fill="#334155" radius={[4, 4, 0, 0]} name="Quota ($K)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Sales Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((rep, idx) => (
            <div key={rep.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700/50 text-slate-400'}`}>
                #{idx + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(rep.name)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{rep.name}</p>
                <p className="text-xs text-slate-400">{rep.dealsWon} deals · {rep.avgDealCycle}d avg cycle</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-bold text-green-400">{formatCurrency(rep.revenue)}</p>
                <p className="text-xs text-slate-400">{formatCurrency(calcCommission(rep.revenue).earned)} commission</p>
              </div>
              {/* Quota attainment bar */}
              <div className="w-32">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${rep.quotaAttainment >= 100 ? 'text-green-400' : rep.quotaAttainment >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{rep.quotaAttainment}%</span>
                  <span className="text-xs text-slate-500">of quota</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${rep.quotaAttainment >= 100 ? 'bg-green-500' : rep.quotaAttainment >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(rep.quotaAttainment, 110)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => {
          const comm = calcCommission(member.revenue);
          const quotaColor = member.quotaAttainment >= 100 ? 'text-green-400' : member.quotaAttainment >= 70 ? 'text-amber-400' : 'text-red-400';
          const quotaBg = member.quotaAttainment >= 100 ? 'bg-green-500' : member.quotaAttainment >= 70 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={member.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{getInitials(member.name)}</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{member.name}</h4>
                  <p className="text-xs text-slate-400">{member.email}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[member.role]}`}>{member.role}</span>
                </div>
              </div>

              {/* Quota Attainment Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Quota Attainment</span>
                  <span className={`text-xs font-bold ${quotaColor}`}>{member.quotaAttainment}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className={`h-3 rounded-full ${quotaBg} transition-all`} style={{ width: `${Math.min(member.quotaAttainment, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">{formatCurrency(member.revenue)}</span>
                  <span className="text-xs text-slate-500">/ {formatCurrency(member.quota)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Deals Won</p>
                  <p className="text-sm font-bold text-blue-400">{member.dealsWon}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Avg Cycle</p>
                  <p className="text-sm font-bold text-cyan-400">{member.avgDealCycle}<span className="text-xs text-slate-500 ml-1">days</span></p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Activities</p>
                  <p className="text-sm font-bold text-purple-400">{member.activitiesCount}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Commission ({comm.tier})</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(comm.earned)}</p>
                </div>
              </div>

              {/* Commission tier breakdown */}
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Commission Tiers:</p>
                <div className="flex gap-1">
                  {COMMISSION_TIERS.map((t, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded ${member.revenue > t.min ? 'bg-amber-500' : 'bg-slate-700'}`} title={`$${t.min / 1000}K-${t.max === Infinity ? '∞' : `$${t.max / 1000}K`}: ${t.rate}%`} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
