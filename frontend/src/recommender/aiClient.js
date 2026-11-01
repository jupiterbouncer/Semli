/**
 * Provider-agnostic wrapper around "an external AI API" (brief §7.3 and
 * §11 deliberately don't name a vendor). The rest of the recommender
 * only depends on this shape:
 *
 *   generate({ context, candidateResources }) => Promise<{
 *     picks: [{ resourceId, explanation }],
 *     tokensUsed: number,
 *     modelTier: 'summarization' | 'reasoning',
 *   }>
 *
 * In production, `generateFn` would call the real provider's API —
 * build the prompt from `candidateResources` only (so the model has
 * nothing to ground itself in except real catalogue entries), parse
 * its response into `picks`, and return the token usage the provider
 * reports so `usageTracker` stays accurate.
 *
 * In tests and local development, inject a stub `generateFn` instead —
 * this is what makes the recommender testable without network access
 * or an API key.
 */
function createAiClient({ generateFn }) {
  if (typeof generateFn !== 'function') {
    throw new Error('createAiClient requires a generateFn({ context, candidateResources })');
  }
  return {
    generate: generateFn,
  };
}

/**
 * Per §7.6: use a smaller/cheaper model for routine summarization and
 * reserve a stronger model for recommendation reasoning that genuinely
 * benefits from it. This just names the two tiers — which real model
 * each maps to is a deployment-time config choice, not hardcoded here,
 * since model names/availability change faster than this logic should.
 */
function selectModelTier(taskType) {
  if (taskType === 'summarize') return 'summarization';
  return 'reasoning';
}

module.exports = { createAiClient, selectModelTier };
