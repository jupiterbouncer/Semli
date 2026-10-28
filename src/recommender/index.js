const { createCatalogue, SEED_RESOURCES } = require('./resourceCatalogue');
const { createCache, buildContextKey } = require('./cache');
const { createUsageTracker } = require('./usageTracker');
const { createAiClient, selectModelTier } = require('./aiClient');
const { validateRecommendations } = require('./validator');
const { createFeedbackStore } = require('./feedback');
const { getRecommendations } = require('./recommend');

/**
 * Wires together default in-memory implementations of every dependency —
 * convenient for local development and as a starting point for tests.
 * A real deployment replaces `cache` and `usageTracker` with
 * Postgres-backed versions and `aiClient` with a real provider call,
 * without changing anything in recommend.js.
 */
function createDefaultRecommenderDeps({ resources = SEED_RESOURCES, generateFn } = {}) {
  return {
    catalogue: createCatalogue(resources),
    cache: createCache(),
    usageTracker: createUsageTracker(),
    aiClient: createAiClient({ generateFn }),
    feedbackStore: createFeedbackStore(),
  };
}

module.exports = {
  createCatalogue,
  SEED_RESOURCES,
  createCache,
  buildContextKey,
  createUsageTracker,
  createAiClient,
  selectModelTier,
  validateRecommendations,
  createFeedbackStore,
  getRecommendations,
  createDefaultRecommenderDeps,
};
