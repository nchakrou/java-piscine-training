import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'user_data.json');

const defaultData = {
  savedCode: {},
  challengeStatus: {},
  submissions: []
};

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return { ...defaultData, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Error loading db file:', err);
  }
  return { ...defaultData };
}

function saveData(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

export const db = {
  getSavedCode(challengeId) {
    const data = loadData();
    return data.savedCode[challengeId] || null;
  },

  setSavedCode(challengeId, code) {
    const data = loadData();
    data.savedCode[challengeId] = code;
    saveData(data);
  },

  getChallengeStatus(challengeId) {
    const data = loadData();
    return data.challengeStatus[challengeId] || null;
  },

  getAllStatuses() {
    const data = loadData();
    return data.challengeStatus || {};
  },

  addSubmission(submission) {
    const data = loadData();
    const subRecord = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...submission
    };
    data.submissions.unshift(subRecord);
    // Keep max 500 submissions
    if (data.submissions.length > 500) {
      data.submissions = data.submissions.slice(0, 500);
    }
    // Update latest challenge status
    data.challengeStatus[submission.challengeId] = submission.status;
    saveData(data);
    return subRecord;
  },

  getSubmissions(challengeId = null) {
    const data = loadData();
    if (!challengeId) return data.submissions;
    return data.submissions.filter(s => s.challengeId === challengeId);
  },

  getStats(totalChallengesCount) {
    const data = loadData();
    const statuses = data.challengeStatus || {};
    let validCount = 0;
    let failedCount = 0;

    Object.values(statuses).forEach(status => {
      if (status === 'VALID') validCount++;
      else if (status === 'FAILED') failedCount++;
    });

    return {
      total: totalChallengesCount,
      valid: validCount,
      failed: failedCount,
      unattempted: Math.max(0, totalChallengesCount - validCount - failedCount),
      totalSubmissions: data.submissions.length
    };
  }
};
