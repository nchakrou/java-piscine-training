import React from 'react';
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import { ChallengeStatus } from '../types';

interface Props {
  status: ChallengeStatus;
  size?: 'sm' | 'md' | 'lg';
  showUnattempted?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showUnattempted = false }) => {
  if (status === 'VALID') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}>
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        VALID
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}>
        <XCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        FAILED
      </span>
    );
  }

  if (showUnattempted) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}>
        <CircleDashed className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        Todo
      </span>
    );
  }

  return null;
};
