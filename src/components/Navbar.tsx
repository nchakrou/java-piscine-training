import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Trophy, BarChart3, Search, Terminal, Sparkles, CheckCircle2, Flag, ChevronDown } from 'lucide-react';
import { QuickSearchModal } from './QuickSearchModal';
import { ChallengeSummary, PlatformStats } from '../types';
import { api } from '../api';

interface Props {
  challenges?: ChallengeSummary[];
}

export const Navbar: React.FC<Props> = ({ challenges = [] }) => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, [location.pathname]);

  // Global keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll detection for dynamic header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' || path === '/challenges') {
      return location.pathname === '/' || location.pathname === '/challenges';
    }
    return location.pathname.startsWith(path);
  };

  const solvedCount = stats ? stats.valid : 0;
  const totalCount = stats ? stats.total : (challenges.length || 109);
  const solvedPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const scrollToCheckpoints = () => {
    const element = document.getElementById('checkpoints');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowMobileMenu(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-dark-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-dark-950/90 backdrop-blur-md border-b border-slate-800/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="JavaForge Home">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                  Java<span className="text-brand-400">Forge</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-slate-500 -mt-1">
                  Piscine Runner
                </span>
              </div>
            </Link>

            {/* Navigation links - Desktop */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <Link
                to="/challenges"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/challenges')
                    ? 'bg-slate-800 text-brand-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Challenges
              </Link>
              
              {/* Checkpoints Anchor Link */}
              <button
                onClick={scrollToCheckpoints}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/' || location.pathname === '/challenges'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Flag className="w-4 h-4" />
                Checkpoints
              </button>
              
              <Link
                to="/submissions"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/submissions')
                    ? 'bg-slate-800 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Submissions
              </Link>
              <Link
                to="/stats"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/stats')
                    ? 'bg-slate-800 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm transition-colors shadow-inner"
              title="Quick Search (Ctrl+K)"
              aria-label="Quick Search (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline text-xs">Search challenges...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Solved Progress Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-900 border border-slate-700/60 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-emerald-400">{solvedCount}</span>
                <span className="text-slate-500">/{totalCount}</span>
                <span className="hidden lg:inline text-slate-400 ml-1 font-mono">({solvedPercent}%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden py-4 px-4 border-t border-slate-800 bg-dark-950 animate-slide-down">
            <nav className="flex flex-col gap-2">
              <Link
                to="/challenges"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/challenges')
                    ? 'bg-slate-800 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <Code2 className="w-5 h-5" />
                Challenges
              </Link>
              <button
                onClick={scrollToCheckpoints}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20"
              >
                <Flag className="w-5 h-5" />
                Checkpoints
              </button>
              <Link
                to="/submissions"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/submissions')
                    ? 'bg-slate-800 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <Trophy className="w-5 h-5" />
                Submissions
              </Link>
              <Link
                to="/stats"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/stats')
                    ? 'bg-slate-800 text-brand-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Global Quick Search Spotlight */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        challenges={challenges}
      />
    </>
  );
};