import React from 'react';
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react';
import { ChallengeStatus } from '../types';

interface Props {
  status: ChallengeStatus;
  size?: 'sm' | 'md' | 'lg';
  showUnattempted?: boolean;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showUnattempted = false }) => {
  if (status === 'VALID') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]} animate-scale-in`}>
        <CheckCircle2 className={iconSizes[size]} />
        VALID
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses[size]} animate-scale-in`}>
        <XCircle className={iconSizes[size]} />
        FAILED
      </span>
    );
  }

  if (showUnattempted) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 ${sizeClasses[size]} animate-scale-in`}>
        <CircleDashed className={iconSizes[size]} />
        Todo
      </span>
    );
  }

  return null;
};