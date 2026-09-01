import React, { useState } from 'react';
import {
  Play,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  History,
  FileCode,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { RunResult, SubmissionRecord } from '../types';

interface Props {
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  runResult: RunResult | null;
  submissions: SubmissionRecord[];
  onLoadSubmissionCode?: (code: string) => void;
  onClearResult?: () => void;
}

export const ConsolePanel: React.FC<Props> = ({
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  runResult,
  submissions = [],
  onLoadSubmissionCode,
  onClearResult,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'output' | 'submissions'>('tests');
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedFailures, setExpandedFailures] = useState<Record<number, boolean>>({});

  const toggleFailure = (index: number) => {
    setExpandedFailures(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const isBusy = isRunning || isSubmitting;

  return (
    <div className={`flex flex-col bg-dark-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl transition-all duration-200 ${
      isExpanded ? 'h-[480px]' : 'h-[280px]'
    }`}>
      
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-dark-950 border-b border-slate-800 text-xs">
        
        {/* Left Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-brand-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Results</span>
            {runResult && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                runResult.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {runResult.status}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'output'
                ? 'bg-slate-800 text-brand-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Console & Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-slate-800 text-brand-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Submissions ({submissions.length})</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {runResult && onClearResult && (
            <button
              onClick={onClearResult}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Clear output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Run Button */}
          <button
            onClick={onRun}
            disabled={isBusy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all shadow-sm ${
              isBusy
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 active:scale-95'
            }`}
            title="Run tests without saving submission status"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                <span>Run</span>
              </>
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isBusy}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-xs transition-all shadow-md ${
              isBusy
                ? 'bg-emerald-800/50 text-emerald-300/50 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
            }`}
            title="Submit solution to validate challenge"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
        
        {/* TAB 1: Test Results */}
        {activeTab === 'tests' && (
          <div>
            {!runResult && !isBusy && (
              <div className="h-full py-12 flex flex-col items-center justify-center text-slate-500">
                <Terminal className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-slate-400 font-sans text-sm">No tests executed yet</p>
                <p className="text-slate-500 font-sans text-xs mt-1">Click &ldquo;Run&rdquo; to test or &ldquo;Submit&rdquo; to validate your solution.</p>
              </div>
            )}

            {isBusy && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 mb-3 animate-spin text-brand-400" />
                <p className="font-sans text-sm font-medium text-slate-200">
                  {isSubmitting ? 'Running complete test suite...' : 'Compiling & running tests in sandbox...'}
                </p>
                <p className="text-slate-500 font-sans text-xs mt-1">Isolating execution and verifying assertions</p>
              </div>
            )}

            {runResult && !isBusy && (
              <div className="space-y-4">
                
                {/* Status Result Banner */}
                <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  runResult.status === 'VALID'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {runResult.status === 'VALID' ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-sans tracking-wide">
                          {runResult.status === 'VALID' ? 'VALID ✓' : 'FAILED ✕'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-900/80 border border-slate-700/60 text-slate-300 font-normal">
                          {runResult.type === 'submit' ? 'Submission' : 'Test Run'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 font-sans">
                        {runResult.status === 'VALID'
                          ? 'All required test cases passed successfully!'
                          : `${runResult.testsSuccessful} / ${runResult.testsFound} tests passed. Check failure details below.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {runResult.durationMs} ms
                    </span>
                    <span className="px-2 py-1 bg-dark-900 rounded border border-slate-700">
                      Score: <strong className={runResult.status === 'VALID' ? 'text-emerald-400' : 'text-rose-400'}>{runResult.testsSuccessful}</strong> / {runResult.testsFound}
                    </span>
                  </div>
                </div>

                {/* Compilation Error Box */}
                {runResult.compilerError && (
                  <div className="p-3.5 bg-rose-950/50 border border-rose-700/50 rounded-lg text-rose-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2 font-sans">
                      <AlertTriangle className="w-4 h-4" />
                      Compilation Error
                    </div>
                    <pre className="text-xs text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {runResult.compilerError}
                    </pre>
                  </div>
                )}

                {/* Failures List */}
                {runResult.failures && runResult.failures.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">
                      Failed Assertions ({runResult.failures.length})
                    </div>
                    {runResult.failures.map((f, idx) => (
                      <div key={idx} className="border border-rose-900/60 bg-dark-950/80 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFailure(idx)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/40 transition-colors gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="font-semibold text-rose-300 truncate">{f.testName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 shrink-0">
                            <span className="text-[11px] truncate max-w-xs text-slate-400">{f.message}</span>
                            {expandedFailures[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </button>

                        {expandedFailures[idx] && f.details && (
                          <div className="p-3 bg-[#0a0d14] border-t border-rose-950 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
                            <pre className="text-rose-400 whitespace-pre-wrap">{f.details}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* TAB 2: Raw Console Output */}
        {activeTab === 'output' && (
          <div className="h-full">
            {runResult?.rawOutput ? (
              <pre className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {runResult.rawOutput}
              </pre>
            ) : (
              <div className="py-12 text-center text-slate-500 font-sans">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No console output</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Past Submissions */}
        {activeTab === 'submissions' && (
          <div className="space-y-2">
            {submissions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-sans">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No previous submissions for this challenge</p>
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="flex items-center justify-between p-3 bg-dark-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {sub.status === 'VALID' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${sub.status === 'VALID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sub.status}
                        </span>
                        <span className="text-slate-400">
                          ({sub.testsSuccessful}/{sub.testsFound} passed)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(sub.timestamp).toLocaleString()} • {sub.durationMs}ms
                      </span>
                    </div>
                  </div>

                  {onLoadSubmissionCode && sub.code && (
                    <button
                      onClick={() => onLoadSubmissionCode(sub.code)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
                      title="Load this code into the editor"
                    >
                      <FileCode className="w-3.5 h-3.5 text-brand-400" />
                      <span>Load Code</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};
