// Tiny TTL cache backed by localStorage. Keys are namespaced + versioned so a
// schema bump invalidates everything by changing CACHE_VERSION.

const CACHE_VERSION = 'v2';
const CACHE_PREFIX = `bbb:${CACHE_VERSION}:`;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

window.normalizeAddress = (addr) => {
  if (!addr) return '';
  return String(addr).trim().toLowerCase().replace(/\s+/g, ' ');
};

window.getCached = (key, ttlMs = DEFAULT_TTL_MS) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (typeof t !== 'number') return null;
    if (Date.now() - t > ttlMs) return null;
    return v;
  } catch {
    return null;
  }
};

window.setCached = (key, value) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // quota — best effort only
  }
};

window.dropCached = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // best effort only
  }
};

window.clearCache = () => {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
  }
};
