import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  History,
  Lightbulb,
  CheckCircle2,
  XCircle,
  FileCode2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  ChallengeDetail,
  SubmissionRecord,
  RunResult,
  ChallengeSummary,
  Checkpoint,
  CheckpointLevel,
  CheckpointExercise,
} from "../types";
import { api } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { DifficultyBadge } from "../components/DifficultyBadge";
import { MarkdownView } from "../components/MarkdownView";
import { CodeEditor } from "../components/CodeEditor";
import { ConsolePanel } from "../components/ConsolePanel";
import { SubmissionCelebration } from "../components/SubmissionCelebration";

// Helper to find next/prev exercise in checkpoint sequence
const getCheckpointSequence = (
  checkpoints: Checkpoint[],
): {
  checkpoint: Checkpoint;
  level: CheckpointLevel;
  exercise: CheckpointExercise;
  globalIndex: number;
}[] => {
  const sequence: {
    checkpoint: Checkpoint;
    level: CheckpointLevel;
    exercise: CheckpointExercise;
    globalIndex: number;
  }[] = [];
  let globalIndex = 0;
  checkpoints.forEach((checkpoint) => {
    checkpoint.levels.forEach((level) => {
      level.exercises.forEach((exercise) => {
        sequence.push({ checkpoint, level, exercise, globalIndex });
        globalIndex++;
      });
    });
  });
  return sequence;
};

const findNextInCheckpoint = (
  sequence: ReturnType<typeof getCheckpointSequence>,
  currentId: string,
) => {
  const currentIndex = sequence.findIndex((s) => s.exercise.id === currentId);
  if (currentIndex === -1 || currentIndex === sequence.length - 1) return null;
  return sequence[currentIndex + 1].exercise.id;
};

const findPrevInCheckpoint = (
  sequence: ReturnType<typeof getCheckpointSequence>,
  currentId: string,
) => {
  const currentIndex = sequence.findIndex((s) => s.exercise.id === currentId);
  if (currentIndex <= 0) return null;
  return sequence[currentIndex - 1].exercise.id;
};

export const ChallengeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [allChallenges, setAllChallenges] = useState<ChallengeSummary[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [code, setCode] = useState<string>("");
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [activeLeftTab, setActiveLeftTab] = useState<
    "desc" | "submissions" | "hints"
  >("desc");

  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const saveTimeoutRef = useRef<any>(null);

  // Fetch challenge details and checkpoints
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setRunResult(null);

    Promise.all([
      api.getChallenge(id),
      api.getChallenges(),
      api.getCheckpoints(),
    ])
      .then(([res, allRes, checkpointsRes]) => {
        setChallenge(res.challenge);
        setSubmissions(res.submissions || []);
        setAllChallenges(allRes.challenges || []);
        setCheckpoints(checkpointsRes.checkpoints || []);

        // Restore saved code or starter code
        const initialCode = res.challenge.userCode || res.challenge.starterCode;
        setCode(initialCode);
      })
      .catch((err) => {
        console.error("Failed to load challenge:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Debounced auto-save
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);

      if (id) {
        // Save locally immediately
        localStorage.setItem(`codecrafter_code_${id}`, newCode);

        // Debounced backend save (800ms)
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setIsSaving(true);
        saveTimeoutRef.current = setTimeout(() => {
          api
            .saveCode(id, newCode)
            .then(() => setIsSaving(false))
            .catch(() => setIsSaving(false));
        }, 800);
      }
    },
    [id],
  );

  // Handle RUN tests
  const handleRun = async () => {
    if (!id || isRunning || isSubmitting) return;
    setIsRunning(true);
    try {
      const result = await api.runCode(id, code);
      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        status: "RUNTIME_ERROR",
        success: false,
        durationMs: 0,
        testsFound: challenge?.totalTests || 1,
        testsSuccessful: 0,
        testsFailed: 1,
        compilerError: err.message,
        rawOutput: err.message,
        failures: [
          {
            testName: "Run Error",
            message: err.message,
            details: err.stack || err.message,
          },
        ],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle SUBMIT tests
  const handleSubmit = async () => {
    if (!id || isRunning || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await api.submitCode(id, code);
      setRunResult(result);

      // Refresh submissions
      if (result.submission) {
        setSubmissions((prev) => [result.submission!, ...prev]);
      }

      // Update challenge status locally
      if (challenge) {
        setChallenge({
          ...challenge,
          status: result.status === "VALID" ? "VALID" : "FAILED",
        });
      }

      // If valid, celebrate!
      if (result.status === "VALID") {
        setShowCelebration(true);
      }
    } catch (err: any) {
      setRunResult({
        status: "RUNTIME_ERROR",
        success: false,
        durationMs: 0,
        testsFound: challenge?.totalTests || 1,
        testsSuccessful: 0,
        testsFailed: 1,
        compilerError: err.message,
        rawOutput: err.message,
        failures: [
          {
            testName: "Submission Error",
            message: err.message,
            details: err.stack || err.message,
          },
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checkpoint-aware Prev / Next
  const checkpointSequence = getCheckpointSequence(checkpoints);
  const nextInCheckpointId = findNextInCheckpoint(checkpointSequence, id);
  const prevInCheckpointId = findPrevInCheckpoint(checkpointSequence, id);

  // Fallback to all challenges order if not in checkpoint
  const currentIndex = allChallenges.findIndex((c) => c.id === id);
  const prevChallenge = prevInCheckpointId
    ? allChallenges.find((c) => c.id === prevInCheckpointId)
    : currentIndex > 0
      ? allChallenges[currentIndex - 1]
      : null;
  const nextChallenge = nextInCheckpointId
    ? allChallenges.find((c) => c.id === nextInCheckpointId)
    : currentIndex < allChallenges.length - 1
      ? allChallenges[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-2" />
        <span className="ml-3 text-sm">Loading workspace...</span>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 bg-dark-900 border border-slate-800 rounded-xl text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-400 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">
          Challenge Not Found
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested challenge &ldquo;{id}&rdquo; could not be found.
        </p>
        <Link
          to="/challenges"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-xs rounded-lg transition-colors"
        >
          Return to Challenge List
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-dark-950">
      {/* Top Workspace Header Bar */}
      <div className="h-12 bg-dark-900 border-b border-slate-800/90 px-4 flex items-center justify-between gap-4 shrink-0 text-xs">
        {/* Left: Navigation & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/challenges"
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            title="Back to all challenges"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Challenges</span>
          </Link>

          <div className="w-px h-4 bg-slate-800" />

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() =>
                prevChallenge && navigate(`/challenges/${prevChallenge.id}`)
              }
              disabled={!prevChallenge}
              className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={
                prevChallenge
                  ? `Previous: ${prevChallenge.title}`
                  : "No previous challenge"
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                nextChallenge && navigate(`/challenges/${nextChallenge.id}`)
              }
              disabled={!nextChallenge}
              className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={
                nextChallenge
                  ? `Next: ${nextChallenge.title}`
                  : "No next challenge"
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          {/* Title & Badges */}
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-sm text-slate-100 truncate">
              {challenge.title}
            </span>
            <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
            <span className="hidden md:inline text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {challenge.category}
            </span>
          </div>
        </div>

        {/* Right: Challenge Status */}
        <div className="flex items-center gap-2 shrink-0">
          {challenge.status && (
            <StatusBadge status={challenge.status} size="sm" />
          )}
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden">
        {/* Left Panel: Problem Description / README & Submissions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-dark-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
          {/* Left Tabs Header */}
          <div className="flex items-center px-2 pt-2 bg-dark-950 border-b border-slate-800 gap-1 text-xs">
            <button
              onClick={() => setActiveLeftTab("desc")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition-colors border-t-2 ${
                activeLeftTab === "desc"
                  ? "bg-dark-900 text-brand-400 border-t-brand-500 border-x border-slate-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border-t-transparent hover:bg-slate-800/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveLeftTab("submissions")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition-colors border-t-2 ${
                activeLeftTab === "submissions"
                  ? "bg-dark-900 text-brand-400 border-t-brand-500 border-x border-slate-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border-t-transparent hover:bg-slate-800/40"
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Submissions ({submissions.length})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab("hints")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md font-medium transition-colors border-t-2 ${
                activeLeftTab === "hints"
                  ? "bg-dark-900 text-brand-400 border-t-brand-500 border-x border-slate-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200 border-t-transparent hover:bg-slate-800/40"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Tips & Guide</span>
            </button>
          </div>

          {/* Left Tab Body */}
          <div className="flex-1 overflow-y-auto">
            {activeLeftTab === "desc" && (
              <MarkdownView content={challenge.readme} />
            )}

            {activeLeftTab === "submissions" && (
              <div className="p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Submission History
                </div>
                {submissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No submissions recorded yet for this challenge.</p>
                    <p className="text-slate-600 mt-1">
                      Click &ldquo;Submit&rdquo; to test your solution and
                      record your verdict.
                    </p>
                  </div>
                ) : (
                  submissions.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="p-3 bg-dark-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {sub.status === "VALID" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${sub.status === "VALID" ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-slate-400 font-mono">
                              ({sub.testsSuccessful}/{sub.testsFound} passed)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(sub.timestamp).toLocaleString()} •{" "}
                            {sub.durationMs}ms
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCodeChange(sub.code)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-colors shrink-0"
                      >
                        Restore Code
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeLeftTab === "hints" && (
              <div className="p-6 text-sm text-slate-300 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Tips & Guidelines for {challenge.title}
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-300 text-xs leading-relaxed">
                  <li>
                    <strong>Class & Method Names:</strong> Ensure your class is
                    named{" "}
                    <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded">
                      {challenge.className}
                    </code>{" "}
                    and methods have the exact signatures specified in the
                    instructions.
                  </li>
                  <li>
                    <strong>Visibility:</strong> Mark your class as{" "}
                    <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded">
                      public
                    </code>{" "}
                    so JUnit test runners can access and instantiate it.
                  </li>
                  <li>
                    <strong>Edge Cases:</strong> Consider boundary conditions
                    like negative numbers, empty strings, null inputs, and zero
                    values.
                  </li>
                  <li>
                    <strong>Execution Sandbox:</strong> Code is compiled with{" "}
                    <code className="text-brand-400 bg-slate-800 px-1 py-0.5 rounded">
                      javac
                    </code>{" "}
                    and tested using JUnit 5 in an isolated sandbox with a 10s
                    execution timeout.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor (Top) + Test Console (Bottom) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2 overflow-hidden h-full">
          {/* Top: Monaco Code Editor */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              fileName={challenge.className}
              starterCode={challenge.starterCode}
              isSaving={isSaving}
            />
          </div>

          {/* Bottom: Console Panel */}
          <div className="shrink-0">
            <ConsolePanel
              onRun={handleRun}
              onSubmit={handleSubmit}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              runResult={runResult}
              submissions={submissions}
              onLoadSubmissionCode={(pastCode) => handleCodeChange(pastCode)}
              onClearResult={() => setRunResult(null)}
            />
          </div>
        </div>
      </div>

      {/* Submission Success Modal with Confetti */}
      <SubmissionCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        challengeTitle={challenge.title}
        nextChallengeId={nextChallenge ? nextChallenge.id : null}
      />
    </div>
  );
};
