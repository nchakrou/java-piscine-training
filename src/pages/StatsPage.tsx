import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, CheckCircle2, XCircle, Flame, Layers, Award, Target } from 'lucide-react';
import { PlatformStats, ChallengeSummary } from '../types';
import { api } from '../api';

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

  // Category stats
  const categoryStats = React.useMemo(() => {
    const map: Record<string, { total: number; valid: number }> = {};
    challenges.forEach(c => {
      if (!map[c.category]) map[c.category] = { total: 0, valid: 0 };
      map[c.category].total++;
      if (c.status === 'VALID') map[c.category].valid++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [challenges]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-dark-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solved Rate</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{completionPercent}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{valid} of {total} Solved</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-dark-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</div>
            <div className="text-2xl font-extrabold text-brand-400 mt-1">{stats?.totalSubmissions || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across all challenges</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-dark-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Attempts</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">{failed}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Needs revision</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-dark-900 border border-slate-800 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining</div>
            <div className="text-2xl font-extrabold text-slate-200 mt-1">{unattempted}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Unattempted challenges</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Topics Mastery Breakdown */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          Topic Mastery
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map(([cat, info]) => {
            const pct = info.total > 0 ? Math.round((info.valid / info.total) * 100) : 0;
            return (
              <div key={cat} className="p-4 bg-dark-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{cat}</span>
                  <span className="font-mono text-slate-400">
                    <strong className="text-emerald-400">{info.valid}</strong> / {info.total} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
