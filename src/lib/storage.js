// Safe localStorage wrapper with in-memory fallback
// Prevents "Access to storage is not allowed from this context" in restricted browser environments

const memoryStore = {};

export function safeGetItem(key, defaultVal = '') {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        memoryStore[key] = val;
        return val;
      }
    }
  } catch (e) {
    // Browser blocked access to window.localStorage
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sVal = window.sessionStorage.getItem(key);
      if (sVal !== null) {
        memoryStore[key] = sVal;
        return sVal;
      }
    }
  } catch (e) {}

  return memoryStore[key] !== undefined ? memoryStore[key] : defaultVal;
}

export function safeSetItem(key, val) {
  const strVal = String(val ?? '');
  memoryStore[key] = strVal;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, strVal);
    }
  } catch (e) {
    // Browser blocked access to window.localStorage
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, strVal);
    }
  } catch (e) {}
}

export function safeRemoveItem(key) {
  delete memoryStore[key];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {}
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (e) {}
}
