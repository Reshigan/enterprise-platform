import { useStore } from '../stores/useStore';
import { formatCurrency, getInitials } from '../lib/utils';
import { Trophy, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const { team, activities } = useStore();

  const performanceData = team.filter(t => t.role !== 'admin').map(t => ({
    name: t.name.split(' ')[0],
    revenue: t.revenue / 1000,
    deals: t.dealsWon,
    activities: t.activitiesCount,
  }));

  const totalRevenue = team.reduce((s, t) => s + t.revenue, 0);
  const totalDeals = team.reduce((s, t) => s + t.dealsWon, 0);
  const totalCommissions = team.reduce((s, t) => s + calcCommission(t.revenue).earned, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Team Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2"><DollarSign size={20} className="text-amber-400" /></div>
          <p className="text-xs text-slate-400">Total Commissions</p>
          <p className="text-xl font-bold text-amber-400">{formatCurrency(totalCommissions)}</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Team Performance (Revenue $K)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue ($K)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(member => {
          const comm = calcCommission(member.revenue);
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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Revenue</p>
                  <p className="text-sm font-bold text-green-400">{formatCurrency(member.revenue)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Deals Won</p>
                  <p className="text-sm font-bold text-blue-400">{member.dealsWon}</p>
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
                    <div key={i} className={`flex-1 h-1 rounded ${member.revenue > t.min ? 'bg-amber-500' : 'bg-slate-700'}`} title={`$${t.min / 1000}K-${t.max === Infinity ? '∞' : `$${t.max / 1000}K`}: ${t.rate}%`} />
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
