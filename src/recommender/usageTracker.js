/**
 * Tracks AI token/request usage per student and in aggregate, and enforces
 * budget limits BEFORE a call is made — not after. Per §7.6/§15, when a
 * threshold is reached the recommender must fall back to the rule-based
 * summary with no AI call, rather than failing the request.
 *
 * In-memory for now; a production version would back this with the
 * `ai_usage` table described in the brief so limits survive a restart
 * and are visible across server instances.
 */
function createUsageTracker() {
  const perStudent = new Map(); // studentId -> { requestCount, tokenCount }
  let aggregate = { requestCount: 0, tokenCount: 0 };

  function getStudentUsage(studentId) {
    return perStudent.get(studentId) || { requestCount: 0, tokenCount: 0 };
  }

  return {
    getStudentUsage,
    getAggregateUsage() {
      return { ...aggregate };
    },

    /**
     * @param {{maxTokensPerStudentPerDay?: number, maxAggregateTokensPerDay?: number}} budget
     * Both limits are optional — omit either to only enforce the other.
     */
    isWithinBudget(studentId, budget = {}) {
      const student = getStudentUsage(studentId);
      if (budget.maxTokensPerStudentPerDay != null && student.tokenCount >= budget.maxTokensPerStudentPerDay) {
        return false;
      }
      if (budget.maxAggregateTokensPerDay != null && aggregate.tokenCount >= budget.maxAggregateTokensPerDay) {
        return false;
      }
      return true;
    },

    recordUsage(studentId, { tokens = 0 } = {}) {
      const current = getStudentUsage(studentId);
      perStudent.set(studentId, {
        requestCount: current.requestCount + 1,
        tokenCount: current.tokenCount + tokens,
      });
      aggregate = {
        requestCount: aggregate.requestCount + 1,
        tokenCount: aggregate.tokenCount + tokens,
      };
    },

    /** Resets all counters — intended for tests, or a scheduled daily reset job. */
    reset() {
      perStudent.clear();
      aggregate = { requestCount: 0, tokenCount: 0 };
    },
  };
}

module.exports = { createUsageTracker };
