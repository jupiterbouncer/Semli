/**
 * Records explicit feedback on recommendations — "helpful," "not
 * relevant," "show me fewer suggestions" — per §7.3 step 5 and §7.5.
 *
 * Per §7.5, this feedback supports evaluation and simple personalization
 * in the first release. It is NOT automatically turned into a training
 * label for any predictive model — that would require the defined
 * purpose, consent/lawful basis, and governance described in §7.2,
 * none of which this module assumes or grants on its own.
 */
function createFeedbackStore() {
  const records = []; // { studentId, recommendationId, resourceId, feedback, at }

  return {
    record({ studentId, recommendationId, resourceId, feedback }) {
      const allowed = ['helpful', 'not_relevant', 'show_fewer'];
      if (!allowed.includes(feedback)) {
        throw new Error(`Unknown feedback type: ${feedback}. Expected one of ${allowed.join(', ')}`);
      }
      const entry = { studentId, recommendationId, resourceId, feedback, at: new Date().toISOString() };
      records.push(entry);
      return entry;
    },

    /** All feedback recorded for one student — useful for simple personalization later. */
    forStudent(studentId) {
      return records.filter((r) => r.studentId === studentId);
    },

    /** Counts per feedback type for one resource — useful for catalogue-level evaluation. */
    summaryForResource(resourceId) {
      const forResource = records.filter((r) => r.resourceId === resourceId);
      return {
        helpful: forResource.filter((r) => r.feedback === 'helpful').length,
        not_relevant: forResource.filter((r) => r.feedback === 'not_relevant').length,
        show_fewer: forResource.filter((r) => r.feedback === 'show_fewer').length,
        total: forResource.length,
      };
    },

    all() {
      return [...records];
    },
  };
}

module.exports = { createFeedbackStore };
