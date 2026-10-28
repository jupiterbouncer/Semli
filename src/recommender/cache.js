const crypto = require('crypto');

/**
 * Builds a deterministic cache key from a recommendation context, per §7.6:
 * "a hash of the triggering context (e.g. deadline-cluster signature +
 * student ID + day)". Two calls with the same student, trigger, signals,
 * and day produce the same key — repeated dashboard loads within that
 * window reuse the cached result instead of calling the AI again.
 *
 * Keys are sorted before stringifying so property order in the input
 * object never changes the resulting hash.
 */
function buildContextKey(context) {
  const stable = {
    studentId: context.studentId,
    trigger: context.trigger,
    date: context.date, // caller-supplied, e.g. '2026-10-27' — not wall-clock time
    signals: sortObjectKeys(context.signals || {}),
  };
  const json = JSON.stringify(stable);
  return crypto.createHash('sha256').update(json).digest('hex');
}

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
}

/**
 * In-memory cache. Swappable for a Postgres-backed one later — only
 * get/set/has need to exist for the rest of the recommender to work.
 */
function createCache() {
  const store = new Map();
  return {
    has(key) {
      return store.has(key);
    },
    get(key) {
      return store.get(key);
    },
    set(key, value) {
      store.set(key, value);
    },
    clear() {
      store.clear();
    },
  };
}

module.exports = { buildContextKey, createCache };
