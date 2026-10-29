const { buildContextKey } = require('./cache');
const { validateRecommendations } = require('./validator');

/**
 * Runs the full recommendation workflow from §7.3:
 *
 *   1. Identify context (passed in by the caller)
 *   2. Retrieve applicable resources from the catalogue
 *   3. Ask the AI to select/explain using that evidence
 *   4. Validate picks against the retrieved catalogue
 *   5. Return with source/relevance, ready for explicit feedback
 *
 * With the §7.6 cost controls applied in the right order: cache is
 * checked BEFORE budget (a cache hit costs nothing, so it should never
 * be blocked by a budget that's about to be spent on a fresh call),
 * and budget is checked BEFORE the AI client is ever invoked.
 *
 * @param {object} args
 * @param {object} args.context - { studentId, trigger, date, signals, filter? }
 * @param {object} args.catalogue - from resourceCatalogue.js
 * @param {object} args.cache - from cache.js
 * @param {object} args.usageTracker - from usageTracker.js
 * @param {object} args.aiClient - from aiClient.js
 * @param {(context: object) => object} args.fallbackProvider - produces a
 *   non-AI result when the budget is exhausted. Intentionally just a
 *   function the caller supplies — this module doesn't import Component A
 *   directly, so the two stay independently testable and swappable.
 * @param {object} [args.budget] - passed through to usageTracker.isWithinBudget
 */
async function getRecommendations({
  context,
  catalogue,
  cache,
  usageTracker,
  aiClient,
  fallbackProvider,
  budget = {},
}) {
  const cacheKey = buildContextKey(context);

  if (cache.has(cacheKey)) {
    return { ...cache.get(cacheKey), source: 'cache' };
  }

  if (!usageTracker.isWithinBudget(context.studentId, budget)) {
    // Awaited so fallbackProvider can itself be async (e.g. it needs to
    // fetch student data before deriving a rule-based summary) — a plain
    // synchronous function still works fine here too, `await` is a no-op
    // on a non-promise value.
    return {
      source: 'fallback-rule-based',
      generatedAt: new Date().toISOString(),
      recommendations: [],
      fallback: await fallbackProvider(context),
    };
  }

  const candidateResources = catalogue.filter(context.filter || {});

  if (candidateResources.length === 0) {
    const empty = {
      source: 'ai',
      generatedAt: new Date().toISOString(),
      recommendations: [],
      rejectedCount: 0,
      note: 'No matching resources found for this context.',
    };
    // Nothing to cache that will change on its own, but caching it still
    // avoids re-deriving "no matches" repeatedly within the same context window.
    cache.set(cacheKey, empty);
    return empty;
  }

  const aiResult = await aiClient.generate({ context, candidateResources });
  const { valid, rejected } = validateRecommendations(aiResult.picks, candidateResources);

  usageTracker.recordUsage(context.studentId, { tokens: aiResult.tokensUsed });

  const result = {
    source: 'ai',
    generatedAt: new Date().toISOString(),
    modelTier: aiResult.modelTier,
    recommendations: valid.map((pick) => {
      const resource = catalogue.getById(pick.resourceId);
      return {
        recommendationId: `${cacheKey}:${pick.resourceId}`,
        resourceId: resource.id,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        explanation: pick.explanation,
      };
    }),
    rejectedCount: rejected.length,
  };

  cache.set(cacheKey, result);
  return result;
}

module.exports = { getRecommendations };
