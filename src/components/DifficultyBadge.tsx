import React from 'react';
import { Difficulty } from '../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
}

export const DifficultyBadge: React.FC<Props> = ({ difficulty, size = 'md' }) => {
  const colorStyles = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  }[difficulty] || 'bg-slate-700 text-slate-300 border-slate-600';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${colorStyles} ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
    }`}>
      {difficulty}
    </span>
  );
};
