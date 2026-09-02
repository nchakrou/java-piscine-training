import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Trophy, CheckCircle2, XCircle, Flame, Layers, Award, Target, TrendingUp, Clock, Zap, Shield, Star, PieChart, Activity } from 'lucide-react';
import { PlatformStats, ChallengeSummary, Difficulty } from '../types';
import { api } from '../api';

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getChallenges()])
      .then(([statsRes, challengesRes]) => {
        setStats(statsRes);
        setChallenges(challengesRes.challenges);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = stats?.total || 109;
  const valid = stats?.valid || 0;
  const failed = stats?.failed || 0;
  const unattempted = total - valid - failed;
  const completionPercent = total > 0 ? Math.round((valid / total) * 100) : 0;
  const avgAttempts = stats?.totalSubmissions && valid > 0 ? (stats.totalSubmissions / valid).toFixed(1) : '0';

  // Category stats
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; valid: number; failed: number }> = {};
    challenges.forEach(c => {
      if (!map[c.category]) map[c.category] = { total: 0, valid: 0, failed: 0 };
      map[c.category].total++;
      if (c.status === 'VALID') map[c.category].valid++;
      if (c.status === 'FAILED') map[c.category].failed++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [challenges]);

  // Difficulty breakdown with more detail
  const difficultyStats = useMemo(() => {
    const diffs: Difficulty[] = ['Easy', 'Medium', 'Hard'];
    return diffs.map(diff => {
      const total = stats?.byDifficulty?.[diff]?.total || 0;
      const valid = stats?.byDifficulty?.[diff]?.valid || 0;
      const failed = challenges.filter(c => c.difficulty === diff && c.status === 'FAILED').length;
      const pct = total > 0 ? Math.round((valid / total) * 100) : 0;
      return { difficulty: diff, total, valid, failed, pct };
    });
  }, [stats, challenges]);

  // Progress over time simulation (submissions by date)
  const submissionTrend = useMemo(() => {
    // This would come from actual submission timestamps in a real app
    return [
      { week: 'Week 1', solved: Math.floor(valid * 0.3), attempted: Math.floor(stats?.totalSubmissions * 0.25) },
      { week: 'Week 2', solved: Math.floor(valid * 0.5), attempted: Math.floor(stats?.totalSubmissions * 0.5) },
      { week: 'Week 3', solved: Math.floor(valid * 0.8), attempted: Math.floor(stats?.totalSubmissions * 0.75) },
      { week: 'Week 4', solved: valid, attempted: stats?.totalSubmissions || 0 },
    ];
  }, [stats, valid]);

  const formatXP = (xp: number) => {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
    return `${xp}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-center py-20">
          <Activity className="w-10 h-10 text-brand-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-400" />
          Analytics & Mastery
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics, difficulty distribution, and topic progress across your Java Piscine journey.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Solved Rate"
          value={`${completionPercent}%`}
          subtitle={`${valid} of ${total} Solved`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
          trend={{ value: '+12%', label: 'vs last week', positive: true }}
        />
        
        <MetricCard
          title="Total Submissions"
          value={stats?.totalSubmissions || 0}
          subtitle="Across all challenges"
          icon={<Target className="w-6 h-6" />}
          iconBg="bg-brand-500/15"
          iconColor="text-brand-400"
          trend={{ value: `${avgAttempts} avg/solve`, label: 'attempts per valid' }}
        />
        
        <MetricCard
          title="Failed Attempts"
          value={failed}
          subtitle="Needs revision"
          icon={<XCircle className="w-6 h-6" />}
          iconBg="bg-rose-500/15"
          iconColor="text-rose-400"
          trend={{ value: `${failed > 0 ? ((failed / (stats?.totalSubmissions || 1)) * 100).toFixed(1) : 0}%`, label: 'failure rate' }}
        />
        
        <MetricCard
          title="Remaining"
          value={unattempted}
          subtitle="Unattempted challenges"
          icon={<Award className="w-6 h-6" />}
          iconBg="bg-slate-800"
          iconColor="text-slate-400"
          trend={{ value: `${Math.round((unattempted / total) * 100)}%`, label: 'of total' }}
        />
      </div>

      {/* Difficulty Mastery */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Difficulty Mastery
          </h2>
          <div className="text-xs text-slate-500">
            {valid} / {total} challenges solved
          </div>
        </div>

        <div className="space-y-4">
          {difficultyStats.map((diff) => (
            <div key={diff.difficulty} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${{
                    Easy: 'bg-emerald-500/20 text-emerald-400',
                    Medium: 'bg-amber-500/20 text-amber-400',
                    Hard: 'bg-rose-500/20 text-rose-400',
                  }[diff.difficulty]}`}>
                    {diff.difficulty[0]}
                  </div>
                  <span className="font-medium text-white capitalize">{diff.difficulty}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="text-xs text-slate-500">
                    <span className="font-mono text-emerald-400">{diff.valid}</span> / {diff.total}
                  </div>
                  <span className={`font-bold text-sm ${{
                    Easy: 'text-emerald-400',
                    Medium: 'text-amber-400',
                    Hard: 'text-rose-400',
                  }[diff.difficulty]}`}>
                    {diff.pct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${{
                    Easy: 'bg-gradient-to-r from-emerald-500 to-teal-400',
                    Medium: 'bg-gradient-to-r from-amber-500 to-orange-400',
                    Hard: 'bg-gradient-to-r from-rose-500 to-red-400',
                  }[diff.difficulty]}`}
                  style={{ width: `${diff.pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                <span>Failed: <span className="font-mono text-rose-400">{diff.failed}</span></span>
                <span>Remaining: <span className="font-mono text-slate-400">{diff.total - diff.valid - diff.failed}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          Topic Mastery
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(([cat, info]) => {
            const pct = info.total > 0 ? Math.round((info.valid / info.total) * 100) : 0;
            const failed = info.failed || 0;
            return (
              <div key={cat} className="p-4 bg-dark-950 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-200">{cat}</span>
                  </div>
                  <span className="text-xs font-mono text-amber-400">{pct}%</span>
                </div>
                
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <span className="font-mono text-emerald-400">{info.valid}</span> solved
                  </span>
                  <span>
                    <span className="font-mono text-rose-400">{failed}</span> failed
                  </span>
                  <span>
                    <span className="font-mono text-slate-400">{info.total - info.valid - failed}</span> left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Trend */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          Progress Trend
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {submissionTrend.map((week, idx) => (
            <div key={week.week} className="p-4 bg-dark-950 border border-slate-800 rounded-xl text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{week.week}</div>
              <div className="text-2xl font-extrabold text-emerald-400 mb-1">{week.solved}</div>
              <div className="text-xs text-slate-500">Solved this week</div>
              <div className="mt-2 pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-500 mb-1">Submissions</div>
                <div className="font-mono text-brand-400">{week.attempted}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label="Total XP Earned"
          value={formatXP(valid * 5000)} // Estimated
          icon={<Zap className="w-5 h-5" />}
          color="text-amber-400"
        />
        <QuickStat
          label="Avg Solve Time"
          value="~12 min"
          icon={<Clock className="w-5 h-5" />}
          color="text-brand-400"
        />
        <QuickStat
          label="Current Streak"
          value="3 days"
          icon={<Star className="w-5 h-5" />}
          color="text-amber-400"
        />
        <QuickStat
          label="Checkpoints Passed"
          value="0 / 2"
          icon={<Shield className="w-5 h-5" />}
          color="text-emerald-400"
        />
      </div>

    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; label: string; positive?: boolean };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, iconBg, iconColor, trend }) => (
  <div className="p-5 bg-dark-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between hover:border-slate-700 transition-colors animate-slide-up">
    <div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-extrabold text-white mt-1">{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] ${trend.positive ? 'text-emerald-400' : 'text-slate-500'}`}>
          <TrendingUp className={`w-3 h-3 ${trend.positive ? '' : 'rotate-180'}`} />
          <span className="font-medium">{trend.value}</span>
          <span className="text-slate-600">{trend.label}</span>
        </div>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
      {icon}
    </div>
  </div>
);

interface QuickStatProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, icon, color }) => (
  <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl text-center hover:border-slate-700 transition-colors">
    <div className={`flex items-center justify-center gap-1.5 mb-2 ${color}`}>{icon}</div>
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
  </div>
);