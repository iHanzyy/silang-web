// src/lib/practiceProgress.js
"use client";

export const STORAGE_KEY = "silang.practice.v1";

// Master data jumlah item per modul (dipakai untuk hitung persen)
export const MODULE_ITEMS = {
  "mod-1": ["A","B","C","D","E"],
  "mod-2": ["F","G","H","I","J"],
  "mod-3": ["K","L","M","N","O"],
  "mod-4": ["P","Q","R","S","T"],
  "mod-5": ["U","V","W","X","Y","Z"],
  "mod-6": ["membangun","memikirkan","membaca","menulis","berlari"], // sementara contoh
};

const DEFAULT_PROGRESS = {
  modules: Object.fromEntries(
    Object.keys(MODULE_ITEMS).map((id) => [id, { index: 0, completed: false }])
  ),
};

export function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const obj = JSON.parse(raw);
    // merge untuk ketahanan ke depan
    return {
      ...DEFAULT_PROGRESS,
      ...obj,
      modules: { ...DEFAULT_PROGRESS.modules, ...(obj.modules || {}) },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function writeProgress(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPercentFor(id, progressObj) {
  const total = MODULE_ITEMS[id]?.length || 1;
  const idx = progressObj.modules[id]?.index ?? 0;
  const pct = Math.round((idx / total) * 100);
  return Math.max(0, Math.min(100, pct));
}
