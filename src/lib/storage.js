// Safe localStorage wrapper with in-memory fallback
// Prevents "Access to storage is not allowed from this context" in restricted browser environments

const memoryStore = {};

export function safeGetItem(key, defaultVal = '') {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : defaultVal;
    }
  } catch (e) {
    // Browser blocked access to window.localStorage
  }
  return memoryStore[key] !== undefined ? memoryStore[key] : defaultVal;
}

export function safeSetItem(key, val) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
  } catch (e) {
    // Browser blocked access to window.localStorage
  }
  memoryStore[key] = String(val);
}

export function safeRemoveItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (e) {}
  delete memoryStore[key];
}
