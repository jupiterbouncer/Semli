/**
 * The anti-hallucination guard described in §7.3 step 4 and §15:
 * "Validate links and identifiers against the retrieved catalogue before
 * showing recommendations." and "The model must not invent Canvas
 * modules, university services, event details, or support contacts."
 *
 * This checks every AI pick against the exact set of candidate resources
 * that were actually sent to the model — not the whole catalogue — since
 * a pick referencing a real-but-unretrieved resource is just as much a
 * grounding failure as a fully invented one.
 *
 * Rejected picks are returned, not silently dropped, so the caller can
 * log/monitor the hallucination rate — an empty `rejected` array over
 * time is itself a useful signal that the AI integration is behaving.
 */
function validateRecommendations(picks, candidateResources) {
  const candidateIds = new Set(candidateResources.map((r) => r.id));
  const valid = [];
  const rejected = [];

  for (const pick of picks) {
    if (pick && candidateIds.has(pick.resourceId)) {
      valid.push(pick);
    } else {
      rejected.push(pick);
    }
  }

  return { valid, rejected };
}

module.exports = { validateRecommendations };
