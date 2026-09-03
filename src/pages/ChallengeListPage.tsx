import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCheck,
  Flag,
  Target,
  Award,
  Zap,
  Layers as LayersIcon,
  BookOpen,
  Clock,
  TrendingUp,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  AlertTriangle,
} from "lucide-react";
import {
  ChallengeSummary,
  Difficulty,
  ChallengeStatus,
  PlatformStats,
  Checkpoint,
  CheckpointLevel,
  CheckpointExercise,
} from "../types";
import { api } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { DifficultyBadge } from "../components/DifficultyBadge";

const DIFFICULTY_COLORS = {
  Easy: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  Medium: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/10",
  },
  Hard: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-rose-500/10",
  },
} as const;

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

export const ChallengeListPage: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "ALL">(
    "ALL",
  );
  const [statusFilter, setStatusFilter] = useState<
    ChallengeStatus | "ALL" | "UNATTEMPTED"
  >("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "default" | "title" | "difficulty" | "status"
  >("default");
  const [expandedCheckpoint, setExpandedCheckpoint] = useState<string | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getChallenges(), api.getStats(), api.getCheckpoints()])
      .then(([challengesRes, statsRes, checkpointsRes]) => {
        setChallenges(challengesRes.challenges);
        setStats(statsRes);
        setCheckpoints(checkpointsRes.checkpoints);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    challenges.forEach((c) => set.add(c.category));
    return ["ALL", ...Array.from(set).sort()];
  }, [challenges]);

  // Filtered & Sorted challenges
  const filteredChallenges = useMemo(() => {
    return challenges
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDiff =
          difficultyFilter === "ALL" || c.difficulty === difficultyFilter;

        const matchesStatus =
          statusFilter === "ALL"
            ? true
            : statusFilter === "UNATTEMPTED"
              ? c.status === null
              : c.status === statusFilter;

        const matchesCat =
          categoryFilter === "ALL" || c.category === categoryFilter;

        return matchesSearch && matchesDiff && matchesStatus && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "difficulty") {
          return DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
        }
        if (sortBy === "status") {
          const rank = { VALID: 1, FAILED: 2, [null as any]: 3 };
          return (rank[a.status as any] || 3) - (rank[b.status as any] || 3);
        }
        return 0;
      });
  }, [
    challenges,
    searchQuery,
    difficultyFilter,
    statusFilter,
    categoryFilter,
    sortBy,
  ]);

  const solvedCount = stats ? stats.valid : 0;
  const failedCount = stats ? stats.failed : 0;
  const totalCount = challenges.length || 109;
  const progressPercent =
    totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Calculate checkpoint progress
  const getCheckpointProgress = (checkpoint: Checkpoint) => {
    let totalExercises = 0;
    let completedExercises = 0;
    checkpoint.levels.forEach((level) => {
      level.exercises.forEach((ex) => {
        totalExercises++;
        const challenge = challenges.find((c) => c.id === ex.id);
        if (challenge?.status === "VALID") completedExercises++;
      });
    });
    return {
      total: totalExercises,
      completed: completedExercises,
      percent:
        totalExercises > 0
          ? Math.round((completedExercises / totalExercises) * 100)
          : 0,
    };
  };

  const getTotalXP = (checkpoint: Checkpoint) => {
    let total = 0;
    checkpoint.levels.forEach((level) => {
      level.exercises.forEach((ex) => (total += ex.xp));
    });
    return total;
  };

  const getCompletedXP = (checkpoint: Checkpoint) => {
    let total = 0;
    checkpoint.levels.forEach((level) => {
      level.exercises.forEach((ex) => {
        const challenge = challenges.find((c) => c.id === ex.id);
        if (challenge?.status === "VALID") total += ex.xp;
      });
    });
    return total;
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k XP`;
    return `${xp} XP`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Progress Card */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              01-Edu Java Module Piscine
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Java Coding Challenges
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Master Java algorithms, data structures, and object-oriented
              design with automated JUnit testing.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Progress:{" "}
                <strong className="text-emerald-400">{solvedCount}</strong> /{" "}
                {totalCount} Solved
              </span>
              <span className="font-bold text-brand-400">
                {progressPercent}%
              </span>
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Difficulty Solved
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 my-2">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Easy</span>
                <span className="text-slate-400 font-mono">
                  {stats?.byDifficulty?.Easy?.valid || 0} /{" "}
                  {stats?.byDifficulty?.Easy?.total || 32}
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
                  {stats?.byDifficulty?.Medium?.valid || 0} /{" "}
                  {stats?.byDifficulty?.Medium?.total || 27}
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
                  {stats?.byDifficulty?.Hard?.valid || 0} /{" "}
                  {stats?.byDifficulty?.Hard?.total || 50}
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status Overview
            </span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-lg font-bold text-emerald-400">
                {solvedCount}
              </div>
              <div className="text-[11px] text-emerald-300 font-medium">
                Passed (VALID)
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="text-lg font-bold text-rose-400">
                {failedCount}
              </div>
              <div className="text-[11px] text-rose-300 font-medium">
                Failed
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Unattempted:</span>
            <span className="font-mono text-slate-300 font-semibold">
              {totalCount - solvedCount - failedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Checkpoints Section */}
      <section className="space-y-6" id="checkpoints">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              Checkpoints & Exam Milestones
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Timed exams that validate your mastery. Each checkpoint unlocks
              after completing the corresponding week's challenges.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-brand-400">
              {checkpoints.length}
            </span>
            <span>Checkpoints</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 animate-pulse text-amber-400" />
            <p>Loading checkpoints...</p>
          </div>
        ) : checkpoints.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-base text-slate-300 font-medium">
              No checkpoints available
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkpoints.map((checkpoint, cpIndex) => {
              const progress = getCheckpointProgress(checkpoint);
              const totalXP = getTotalXP(checkpoint);
              const completedXP = getCompletedXP(checkpoint);
              const isExpanded = expandedCheckpoint === checkpoint.id;
              const weekLabel = `Week ${checkpoint.week}`;

              return (
                <div
                  key={checkpoint.id}
                  className="group relative bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-700"
                >
                  {/* Checkpoint Header */}
                  <button
                    onClick={() =>
                      setExpandedCheckpoint(isExpanded ? null : checkpoint.id)
                    }
                    className="w-full p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Checkpoint Icon & Number */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Flag className="w-7 h-7 text-white" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-950 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                        {cpIndex + 1}
                      </span>
                    </div>

                    {/* Checkpoint Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg text-white truncate">
                          {checkpoint.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                          {weekLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          {checkpoint.examId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          Difficulty {checkpoint.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {checkpoint.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Expected:{" "}
                          <span className="font-mono text-amber-400">
                            {formatXP(checkpoint.expectedXP)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Total Exercises:{" "}
                          <span className="font-mono text-brand-400">
                            {formatXP(totalXP)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration:{" "}
                          <span className="font-mono text-slate-400">
                            {checkpoint.durationDays} day
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          XP Index:{" "}
                          <span className="font-mono text-emerald-400">
                            {checkpoint.xpIndex}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.1)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="url(#checkpoint-gradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress.percent / 100)}`}
                            className="transition-all duration-500"
                          />
                          <defs>
                            <linearGradient
                              id="checkpoint-gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {progress.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">
                          Exercises
                        </div>
                        <div className="font-mono text-sm text-slate-300">
                          {progress.completed} / {progress.total}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          XP Earned
                        </div>
                        <div className="font-mono text-sm text-amber-400">
                          {formatXP(completedXP)} / {formatXP(totalXP)}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0 ml-2">
                      <div
                        className={`w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Levels */}
                  <div
                    className={`${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden transition-all duration-300 ease-out`}
                    style={{ maxHeight: isExpanded ? "2000px" : "0" }}
                  >
                    <div className="border-t border-slate-800 bg-slate-950/50">
                      <div className="p-4 px-6">
                        {checkpoint.levels.map((level, levelIndex) => (
                          <CheckpointLevelCard
                            key={`level-${level.level}`}
                            level={level}
                            levelIndex={levelIndex}
                            challenges={challenges}
                            navigate={navigate}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filters & Search Toolbar */}
      <div className="bg-dark-900 border border-slate-800/90 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, topic or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-dark-950 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Difficulty Filter */}
            <div className="flex items-center bg-dark-950 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              {(["ALL", "Easy", "Medium", "Hard"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    difficultyFilter === diff
                      ? "bg-slate-800 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
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
              onChange={(e) => setSortBy(e.target.value as any)}
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
            <LayersIcon className="w-3.5 h-3.5" />
            Topics:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/40 font-medium"
                  : "bg-dark-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {cat === "ALL" ? "All Topics" : cat}
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
            <p className="text-base text-slate-300 font-medium">
              No challenges found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try resetting your filters or search query.
            </p>
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
                  {challenge.status === "VALID" ? (
                    <div
                      className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
                      title="Passed All Tests"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : challenge.status === "FAILED" ? (
                    <div
                      className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center"
                      title="Failed Tests"
                    >
                      <XCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full text-slate-600 flex items-center justify-center"
                      title="Not submitted yet"
                    >
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
                    {challenge.status && (
                      <StatusBadge status={challenge.status} size="sm" />
                    )}
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
                  <DifficultyBadge
                    difficulty={challenge.difficulty}
                    size="sm"
                  />
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
                    <span>
                      {challenge.status === "VALID" ? "Review" : "Solve"}
                    </span>
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

// Checkpoint Level Card Component
interface CheckpointLevelCardProps {
  level: CheckpointLevel;
  levelIndex: number;
  challenges: ChallengeSummary[];
  navigate: (path: string) => void;
}

const CheckpointLevelCard: React.FC<CheckpointLevelCardProps> = ({
  level,
  levelIndex,
  challenges,
  navigate,
}) => {
  const levelColors = [
    { from: "emerald-500", to: "teal-400", text: "text-emerald-400" },
    { from: "amber-500", to: "orange-400", text: "text-amber-400" },
    { from: "blue-500", to: "cyan-400", text: "text-blue-400" },
    { from: "purple-500", to: "pink-400", text: "text-purple-400" },
    { from: "rose-500", to: "red-400", text: "text-rose-400" },
  ];

  const colors = levelColors[levelIndex % levelColors.length];

  const completedExercises = level.exercises.filter((ex) => {
    const challenge = challenges.find((c) => c.id === ex.id);
    return challenge?.status === "VALID";
  }).length;

  const totalExercises = level.exercises.length;
  const percent =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;
  const totalLevelXP = level.exercises.reduce((sum, ex) => sum + ex.xp, 0);

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg bg-gradient-to-br from-${colors.from} to-${colors.to} flex items-center justify-center shadow-sm`}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Level {level.level}</div>
            <div className="text-[11px] text-slate-500">
              Difficulty {level.difficulty} • {totalExercises} exercises
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">XP Reward</div>
          <div className="font-bold text-amber-400 font-mono">
            {formatXP(totalLevelXP)}
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r from-${colors.from} to-${colors.to}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {[...level.exercises]
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((exercise, exIndex) => {
            const challenge = challenges.find((c) => c.id === exercise.id);
            const isCompleted = challenge?.status === "VALID";
            const isFailed = challenge?.status === "FAILED";

            return (
              <button
                key={exercise.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (challenge) navigate(`/challenges/${challenge.id}`);
                }}
                className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 group ${
                  isCompleted
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : isFailed
                      ? "bg-rose-500/10 border border-rose-500/30"
                      : "bg-dark-950 border border-slate-700/50 hover:border-brand-500/50 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isFailed ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <span className="text-slate-500">{exIndex + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-sm truncate ${isCompleted ? "text-emerald-300" : isFailed ? "text-rose-300" : "text-slate-200"}`}
                  >
                    {exercise.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span className="font-mono text-amber-400">
                      {formatXP(exercise.xp)}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
      </div>
    </div>
  );
};

function formatXP(xp: number) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k XP`;
  return `${xp} XP`;
}
