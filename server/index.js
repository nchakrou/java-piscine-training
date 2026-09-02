import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { runTestExecution } from './runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CHALLENGES_FILE = path.join(ROOT_DIR, 'data', 'challenges.json');
const CHECKPOINTS_FILE = path.join(ROOT_DIR, 'data', 'checkpoints.json');

// Load challenges dataset
let challenges = [];
try {
  challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
  console.log(`Loaded ${challenges.length} challenges from challenges.json`);
} catch (err) {
  console.error('Failed to load challenges:', err);
}

const challengeMap = new Map(challenges.map(c => [c.id, c]));

// Load checkpoints dataset
let checkpoints = [];
try {
  checkpoints = JSON.parse(fs.readFileSync(CHECKPOINTS_FILE, 'utf-8'));
  console.log(`Loaded ${checkpoints.length} checkpoints from checkpoints.json`);
} catch (err) {
  console.error('Failed to load checkpoints:', err);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 1. List all challenges with current user statuses
app.get('/api/challenges', (req, res) => {
  const statuses = db.getAllStatuses();
  const list = challenges.map(c => ({
    id: c.id,
    title: c.title,
    difficulty: c.difficulty,
    category: c.category,
    description: c.description,
    totalTests: c.totalTests || 1,
    status: statuses[c.id] || null
  }));
  res.json({ challenges: list });
});

// 2. Get single challenge details
app.get('/api/challenges/:id', (req, res) => {
  const { id } = req.params;
  const challenge = challengeMap.get(id);
  if (!challenge) {
    return res.status(404).json({ error: `Challenge '${id}' not found` });
  }

  const status = db.getChallengeStatus(id);
  const savedCode = db.getSavedCode(id);
  const submissions = db.getSubmissions(id);

  res.json({
    challenge: {
      ...challenge,
      status: status || null,
      userCode: savedCode || challenge.starterCode
    },
    submissions
  });
});

// 3. Save draft code
app.post('/api/challenges/:id/save', (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Code must be a string' });
  }
  db.setSavedCode(id, code);
  res.json({ success: true, savedAt: new Date().toISOString() });
});

// 4. Run tests (Does NOT update persistent challenge status)
app.post('/api/challenges/:id/run', async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  const challenge = challengeMap.get(id);
  if (!challenge) {
    return res.status(404).json({ error: `Challenge '${id}' not found` });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Save code state
  db.setSavedCode(id, code);

  try {
    const result = await runTestExecution({ challenge, code, isSubmit: false });
    res.json({
      type: 'run',
      challengeId: id,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      error: 'Execution failed: ' + err.message
    });
  }
});

// 5. Submit solution (Runs full validation and PERSISTS status VALID / FAILED)
app.post('/api/challenges/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;
  const challenge = challengeMap.get(id);
  if (!challenge) {
    return res.status(404).json({ error: `Challenge '${id}' not found` });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Save code state
  db.setSavedCode(id, code);

  try {
    const result = await runTestExecution({ challenge, code, isSubmit: true });
    
    // Determine verdict
    const status = result.status === 'VALID' ? 'VALID' : 'FAILED';

    // Persist submission
    const submissionRecord = db.addSubmission({
      challengeId: id,
      challengeTitle: challenge.title,
      difficulty: challenge.difficulty,
      category: challenge.category,
      status: status,
      code: code,
      testsFound: result.testsFound,
      testsSuccessful: result.testsSuccessful,
      testsFailed: result.testsFailed,
      durationMs: result.durationMs,
      failures: result.failures || [],
      compilerError: result.compilerError || null
    });

    res.json({
      type: 'submit',
      challengeId: id,
      status: status,
      submission: submissionRecord,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      error: 'Submission execution failed: ' + err.message
    });
  }
});

// 6. Submissions list
app.get('/api/submissions', (req, res) => {
  const { challengeId } = req.query;
  const submissions = db.getSubmissions(challengeId || null);
  res.json({ submissions });
});

// 7. Overall stats
app.get('/api/stats', (req, res) => {
  const stats = db.getStats(challenges.length);
  const statuses = db.getAllStatuses();

  // Difficulty breakdown
  const byDifficulty = {
    Easy: { total: 0, valid: 0 },
    Medium: { total: 0, valid: 0 },
    Hard: { total: 0, valid: 0 }
  };

  challenges.forEach(c => {
    if (byDifficulty[c.difficulty]) {
      byDifficulty[c.difficulty].total++;
      if (statuses[c.id] === 'VALID') {
        byDifficulty[c.difficulty].valid++;
      }
    }
  });

  res.json({
    ...stats,
    byDifficulty
  });
});

// 8. Checkpoints
app.get('/api/checkpoints', (req, res) => {
  res.json({ checkpoints });
});

// Serve frontend in production
const distPath = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
