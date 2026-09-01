import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, Code2, ArrowRight, Eye, X, Filter } from 'lucide-react';
import { SubmissionRecord } from '../types';
import { api } from '../api';
import { DifficultyBadge } from '../components/DifficultyBadge';

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VALID' | 'FAILED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);

  useEffect(() => {
    api.getSubmissions()
      .then(res => setSubmissions(res.submissions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter(s => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-400" />
            Submission History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review all previous test validation runs and submitted solutions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-dark-900 border border-slate-800 rounded-lg p-1 text-xs">
          {(['ALL', 'VALID', 'FAILED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Submissions' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-dark-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Status</div>
          <div className="col-span-4">Challenge</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">Runtime</div>
          <div className="col-span-2 text-right">Submitted At</div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Code2 className="w-10 h-10 mx-auto mb-2 animate-pulse text-brand-400" />
            <p>Loading submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-base text-slate-300 font-medium">No submissions found</p>
            <p className="text-xs text-slate-500 mt-1">Submit solutions in the challenge workspace to see them here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map(sub => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/40 cursor-pointer transition-colors text-xs"
              >
                {/* Status */}
                <div className="col-span-2 flex items-center gap-2">
                  {sub.status === 'VALID' ? (
                    <span className="inline-flex items-center gap-1.5 font-bold font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VALID
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-bold font-mono text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-full text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      FAILED
                    </span>
                  )}
                </div>

                {/* Challenge */}
                <div className="col-span-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 truncate">
                      {sub.challengeTitle || sub.challengeId}
                    </span>
                    {sub.difficulty && <DifficultyBadge difficulty={sub.difficulty} size="sm" />}
                  </div>
                  {sub.category && (
                    <span className="text-[11px] text-slate-500 font-mono">{sub.category}</span>
                  )}
                </div>

                {/* Score */}
                <div className="col-span-2 text-center font-mono">
                  <span className={sub.status === 'VALID' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {sub.testsSuccessful}
                  </span>
                  <span className="text-slate-500"> / {sub.testsFound} tests</span>
                </div>

                {/* Runtime */}
                <div className="col-span-2 text-center text-slate-400 font-mono flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {sub.durationMs} ms
                </div>

                {/* Date & Action */}
                <div className="col-span-2 text-right text-slate-400">
                  <span>{new Date(sub.timestamp).toLocaleDateString()} {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Code Inspector Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-dark-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-dark-950 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white text-sm">
                  {selectedSubmission.challengeTitle || selectedSubmission.challengeId}
                </span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                  selectedSubmission.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {selectedSubmission.status} ({selectedSubmission.testsSuccessful}/{selectedSubmission.testsFound})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/challenges/${selectedSubmission.challengeId}`}
                  className="px-3 py-1 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded text-xs font-medium flex items-center gap-1"
                >
                  Open Workspace
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#0a0d14]">
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-dark-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
              <span>Submitted: {new Date(selectedSubmission.timestamp).toLocaleString()}</span>
              <span>Runtime: {selectedSubmission.durationMs}ms</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
