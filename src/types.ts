export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeStatus = 'VALID' | 'FAILED' | null;

export interface ChallengeSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  totalTests: number;
  status: ChallengeStatus;
}

export interface ChallengeDetail extends ChallengeSummary {
  className: string;
  testClass: string;
  testFolder: string;
  readme: string;
  starterCode: string;
  userCode?: string;
}

export interface TestFailure {
  testName: string;
  message: string;
  details?: string;
}

export interface RunResult {
  type?: 'run' | 'submit';
  challengeId?: string;
  status: 'VALID' | 'FAILED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT';
  success: boolean;
  durationMs: number;
  testsFound: number;
  testsSuccessful: number;
  testsFailed: number;
  testsSkipped?: number;
  failures?: TestFailure[];
  compilerError?: string | null;
  rawOutput?: string;
  submission?: SubmissionRecord;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  challengeId: string;
  challengeTitle?: string;
  difficulty?: Difficulty;
  category?: string;
  status: 'VALID' | 'FAILED';
  code: string;
  testsFound: number;
  testsSuccessful: number;
  testsFailed: number;
  durationMs: number;
  failures?: TestFailure[];
  compilerError?: string | null;
}

export interface PlatformStats {
  total: number;
  valid: number;
  failed: number;
  unattempted: number;
  totalSubmissions: number;
  byDifficulty: {
    Easy: { total: number; valid: number };
    Medium: { total: number; valid: number };
    Hard: { total: number; valid: number };
  };
}
