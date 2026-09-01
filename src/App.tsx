import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChallengeListPage } from './pages/ChallengeListPage';
import { ChallengeWorkspacePage } from './pages/ChallengeWorkspacePage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { StatsPage } from './pages/StatsPage';
import { ChallengeSummary } from './types';
import { api } from './api';

export const App: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);

  useEffect(() => {
    api.getChallenges()
      .then(res => setChallenges(res.challenges || []))
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-950 flex flex-col text-slate-100">
        <Navbar challenges={challenges} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ChallengeListPage />} />
            <Route path="/challenges" element={<ChallengeListPage />} />
            <Route path="/challenges/:id" element={<ChallengeWorkspacePage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
