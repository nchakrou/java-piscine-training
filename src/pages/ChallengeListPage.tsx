import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Filter,
  ArrowUpDown,
  Sparkles,
  Trophy,
  Flame,
  Layers,
  ArrowRight,
  Code2,
  CheckCheck
} from 'lucide-react';
import { ChallengeSummary, Difficulty, ChallengeStatus, PlatformStats } from '../types';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { DifficultyBadge } from '../components/DifficultyBadge';

export const ChallengeListPage: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | 'ALL' | 'UNATTEMPTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'difficulty' | 'status'>('default');

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getChallenges(), api.getStats()])
      .then(([challengesRes, statsRes]) => {
        setChallenges(challengesRes.challenges);
        setStats(statsRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    challenges.forEach(c => set.add(c.category));
    return ['ALL', ...Array.from(set).sort()];
  }, [challenges]);

  // Filtered & Sorted challenges
  const filteredChallenges = useMemo(() => {
    return challenges
      .filter(c => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDiff = difficultyFilter === 'ALL' || c.difficulty === difficultyFilter;

        const matchesStatus =
          statusFilter === 'ALL'
            ? true
            : statusFilter === 'UNATTEMPTED'
            ? c.status === null
            : c.status === statusFilter;

        const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;

        return matchesSearch && matchesDiff && matchesStatus && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'difficulty') {
          const rank = { Easy: 1, Medium: 2, Hard: 3 };
          return rank[a.difficulty] - rank[b.difficulty];
        }
        if (sortBy === 'status') {
          const rank = { VALID: 1, FAILED: 2, [null as any]: 3 };
          return (rank[a.status as any] || 3) - (rank[b.status as any] || 3);
        }
        return 0;
      });
  }, [challenges, searchQuery, difficultyFilter, statusFilter, categoryFilter, sortBy]);

  const solvedCount = stats ? stats.valid : 0;
  const failedCount = stats ? stats.failed : 0;
  const totalCount = challenges.length || 109;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Progress Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              01-Edu Java Module Piscine
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Java Coding Challenges
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Master Java algorithms, data structures, and object-oriented design with automated JUnit testing.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Progress: <strong className="text-emerald-400">{solvedCount}</strong> / {totalCount} Solved
              </span>
              <span className="font-bold text-brand-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Card */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Solved</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 my-2">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Easy</span>
                <span className="text-slate-400 font-mono">
                  {stats?.byDifficulty?.Easy?.valid || 0} / {stats?.byDifficulty?.Easy?.total || 32}
                </span>
              </div>
              <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      ((stats?.byDifficulty?.Easy?.valid || 0) /
                        (stats?.byDifficulty?.Easy?.total || 32)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">Medium</span>
                <span className="text-slate-400 font-mono">
                  {stats?.byDifficulty?.Medium?.valid || 0} / {stats?.byDifficulty?.Medium?.total || 27}
                </span>
              </div>
              <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${
                      ((stats?.byDifficulty?.Medium?.valid || 0) /
                        (stats?.byDifficulty?.Medium?.total || 27)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-medium">Hard</span>
                <span className="text-slate-400 font-mono">
                  {stats?.byDifficulty?.Hard?.valid || 0} / {stats?.byDifficulty?.Hard?.total || 50}
                </span>
              </div>
              <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${
                      ((stats?.byDifficulty?.Hard?.valid || 0) /
                        (stats?.byDifficulty?.Hard?.total || 50)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-right">
            Total {totalCount} challenges
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Overview</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-lg font-bold text-emerald-400">{solvedCount}</div>
              <div className="text-[11px] text-emerald-300 font-medium">Passed (VALID)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-lg font-bold text-rose-400">{failedCount}</div>
              <div className="text-[11px] text-rose-300 font-medium">Failed</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Unattempted:</span>
            <span className="font-mono text-slate-300 font-semibold">{totalCount - solvedCount - failedCount}</span>
          </div>
        </div>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-dark-900 border border-slate-800/90 rounded-xl p-4 shadow-lg space-y-3">
        
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, topic or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-dark-950 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Difficulty Filter */}
            <div className="flex items-center bg-dark-950 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              {(['ALL', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    difficultyFilter === diff
                      ? 'bg-slate-800 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">Status: All</option>
              <option value="VALID">Status: VALID (Solved)</option>
              <option value="FAILED">Status: FAILED</option>
              <option value="UNATTEMPTED">Status: Unattempted</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-dark-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="default">Sort: Default</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="status">Sort: Status</option>
            </select>

          </div>

        </div>

        {/* Category Pills Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Topics:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40 font-medium'
                  : 'bg-dark-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Topics' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Challenges List Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-dark-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-5 md:col-span-4">Challenge</div>
          <div className="hidden md:block col-span-3">Topic / Category</div>
          <div className="col-span-3 md:col-span-2 text-center">Difficulty</div>
          <div className="col-span-3 md:col-span-2 text-right">Action</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Code2 className="w-10 h-10 mx-auto mb-2 animate-pulse text-brand-400" />
            <p>Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-base text-slate-300 font-medium">No challenges found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredChallenges.map((challenge, idx) => (
              <div
                key={challenge.id}
                onClick={() => navigate(`/challenges/${challenge.id}`)}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                
                {/* 1. Status Icon */}
                <div className="col-span-1 flex items-center justify-center">
                  {challenge.status === 'VALID' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center" title="Passed All Tests">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : challenge.status === 'FAILED' ? (
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center" title="Failed Tests">
                      <XCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full text-slate-600 flex items-center justify-center" title="Not submitted yet">
                      <CircleDashed className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* 2. Challenge Name & Description */}
                <div className="col-span-5 md:col-span-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-brand-400 transition-colors truncate">
                      {idx + 1}. {challenge.title}
                    </span>
                    {challenge.status && <StatusBadge status={challenge.status} size="sm" />}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {challenge.description}
                  </p>
                </div>

                {/* 3. Category Tag */}
                <div className="hidden md:block col-span-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
                    {challenge.category}
                  </span>
                </div>

                {/* 4. Difficulty */}
                <div className="col-span-3 md:col-span-2 text-center">
                  <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                </div>

                {/* 5. Action */}
                <div className="col-span-3 md:col-span-2 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/challenges/${challenge.id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-brand-500 hover:text-dark-950 text-slate-200 transition-all border border-slate-700/60 group-hover:border-brand-500/50"
                  >
                    <span>{challenge.status === 'VALID' ? 'Review' : 'Solve'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
