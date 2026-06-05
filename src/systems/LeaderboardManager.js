import badwords from '../data/badwords.json';
import { MAX_LEADERBOARD, MAX_NICKNAME_LEN, LEADERBOARD_KEY } from '../constants.js';

function containsBadWord(text) {
  const lower = text.toLowerCase();
  return badwords.some(w => lower.includes(w.toLowerCase()));
}

function sanitizeNickname(raw) {
  let name = raw.trim().slice(0, MAX_NICKNAME_LEN);
  name = name.replace(/[<>&"']/g, '');
  if (containsBadWord(name)) {
    name = name[0] + '***';
  }
  return name || '玩家';
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLeaderboard(data) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
}

function getTodayBoard() {
  const all = loadLeaderboard();
  const key = getTodayKey();
  return all[key] || [];
}

function addScore(nickname, score) {
  const name = sanitizeNickname(nickname);
  const all = loadLeaderboard();
  const key = getTodayKey();
  if (!all[key]) all[key] = [];
  all[key].push({ name, score, time: Date.now() });
  all[key].sort((a, b) => b.score - a.score);
  all[key] = all[key].slice(0, MAX_LEADERBOARD);
  saveLeaderboard(all);
  return all[key];
}

export { sanitizeNickname, getTodayBoard, addScore, containsBadWord };
