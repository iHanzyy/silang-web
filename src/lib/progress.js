const STORE_KEY = "silang.practice.v1";

function read() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}

function write(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function getModuleProgress(moduleId) {
  const db = read();
  return db[moduleId] || { index: 0, completed: false, updatedAt: 0 };
}

export function setModuleProgress(moduleId, patch) {
  const db = read();
  db[moduleId] = { ...getModuleProgress(moduleId), ...patch, updatedAt: Date.now() };
  write(db);
}

export function resetModuleProgress(moduleId) {
  const db = read();
  delete db[moduleId];
  write(db);
}

/** Simpan daftar kata untuk modul-6 supaya konsisten di sesi berikutnya. */
export function ensureWordsForModule(moduleId, generator) {
  const cur = getModuleProgress(moduleId);
  if (Array.isArray(cur.words) && cur.words.length) return cur.words;
  const words = generator();
  setModuleProgress(moduleId, { words, wordIdx: 0, letterIdx: 0, completed: false });
  return words;
}
