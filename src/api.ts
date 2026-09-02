import { ChallengeSummary, ChallengeDetail, RunResult, SubmissionRecord, PlatformStats, Checkpoint } from './types';

const API_BASE = '/api';

export const api = {
  async getChallenges(): Promise<{ challenges: ChallengeSummary[] }> {
    const res = await fetch(`${API_BASE}/challenges`);
    if (!res.ok) throw new Error('Failed to fetch challenges');
    return res.json();
  },

  async getChallenge(id: string): Promise<{ challenge: ChallengeDetail; submissions: SubmissionRecord[] }> {
    const res = await fetch(`${API_BASE}/challenges/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch challenge: ${id}`);
    return res.json();
  },

  async saveCode(id: string, code: string): Promise<{ success: boolean; savedAt: string }> {
    const res = await fetch(`${API_BASE}/challenges/${id}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('Failed to save draft code');
    return res.json();
  },

  async runCode(id: string, code: string): Promise<RunResult> {
    const res = await fetch(`${API_BASE}/challenges/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute test run');
    }
    return res.json();
  },

  async submitCode(id: string, code: string): Promise<RunResult> {
    const res = await fetch(`${API_BASE}/challenges/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit solution');
    }
    return res.json();
  },

  async getSubmissions(challengeId?: string): Promise<{ submissions: SubmissionRecord[] }> {
    const url = challengeId ? `${API_BASE}/submissions?challengeId=${challengeId}` : `${API_BASE}/submissions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch submissions');
    return res.json();
  },

  async getStats(): Promise<PlatformStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getCheckpoints(): Promise<{ checkpoints: Checkpoint[] }> {
    const res = await fetch(`${API_BASE}/checkpoints`);
    if (!res.ok) throw new Error('Failed to fetch checkpoints');
    return res.json();
  }
};
