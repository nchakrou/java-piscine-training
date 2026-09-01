import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  show: boolean;
  onClose: () => void;
  challengeTitle: string;
  nextChallengeId?: string | null;
}

export const SubmissionCelebration: React.FC<Props> = ({
  show,
  onClose,
  challengeTitle,
  nextChallengeId,
}) => {
  useEffect(() => {
    if (show) {
      // Fire celebratory confetti cannons
      const end = Date.now() + 1200;
      const colors = ['#10b981', '#38bdf8', '#6366f1', '#f59e0b'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-md w-full bg-dark-900 border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-white mb-1 flex items-center justify-center gap-2">
          Challenge Solved!
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <p className="text-sm text-slate-300 mb-4 font-mono font-medium">
          {challengeTitle}
        </p>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm mb-6">
          <CheckCircle2 className="w-4 h-4" />
          STATUS: VALID (All Tests Passed)
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Review Code
          </button>
          
          {nextChallengeId ? (
            <Link
              to={`/challenges/${nextChallengeId}`}
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-dark-950 font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              Next Challenge
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/challenges"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold text-sm transition-colors"
            >
              Back to List
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
