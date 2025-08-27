const STORE_KEY = "silang.practice.v1";

// Default structure to match practiceProgress.js
const DEFAULT_PROGRESS = {
  modules: {
    "mod-1": { index: 0, completed: false },
    "mod-2": { index: 0, completed: false },
    "mod-3": { index: 0, completed: false },
    "mod-4": { index: 0, completed: false },
    "mod-5": { index: 0, completed: false },
    "mod-6": { index: 0, completed: false, wordIdx: 0 }
  }
};

function read() {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try { 
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const obj = JSON.parse(raw);
    
    // Handle old format (direct keys) vs new format (nested under modules)
    if (obj.modules) {
      return {
        ...DEFAULT_PROGRESS,
        ...obj,
        modules: { ...DEFAULT_PROGRESS.modules, ...obj.modules }
      };
    } else {
      // Convert old format to new format
      const converted = {
        modules: { ...DEFAULT_PROGRESS.modules }
      };
      
      // Migrate old data
      Object.keys(obj).forEach(key => {
        if (key.startsWith('mod-')) {
          converted.modules[key] = { ...DEFAULT_PROGRESS.modules[key], ...obj[key] };
        }
      });
      
      // Save converted format
      write(converted);
      return converted;
    }
  }
  catch { return DEFAULT_PROGRESS; }
}

function write(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function getModuleProgress(moduleId) {
  const db = read();
  return db.modules[moduleId] || DEFAULT_PROGRESS.modules[moduleId] || { index: 0, completed: false };
}

export function setModuleProgress(moduleId, patch) {
  const db = read();
  const currentProgress = getModuleProgress(moduleId);
  
  // Update the nested structure
  db.modules[moduleId] = { 
    ...currentProgress, 
    ...patch, 
    updatedAt: Date.now() 
  };
  
  write(db);
  
  // Debug logging
  console.log(`📊 setModuleProgress called for ${moduleId}:`, patch);
  console.log(`📊 Updated progress:`, db.modules[moduleId]);
  console.log(`📊 Full localStorage:`, db);
}

export function resetModuleProgress(moduleId) {
  const db = read();
  db.modules[moduleId] = { ...DEFAULT_PROGRESS.modules[moduleId] };
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
