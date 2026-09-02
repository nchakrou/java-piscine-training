import React from 'react';
import { Difficulty } from '../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const glowClasses = {
  Easy: 'shadow-emerald-500/10',
  Medium: 'shadow-amber-500/10',
  Hard: 'shadow-rose-500/10',
};

const colorStyles = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
} as const;

export const DifficultyBadge: React.FC<Props> = ({ difficulty, size = 'md' }) => {
  const colors = colorStyles[difficulty] || 'bg-slate-700 text-slate-300 border-slate-600';
  const glow = glowClasses[difficulty as Difficulty] || '';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${colors} ${sizeClasses[size]} ${glow} animate-fade-in`}>
      {difficulty}
    </span>
  );
};