const { computeDeadlinePressure } = require('./deadlinePressure');
const { computeSubmissionRhythm } = require('./submissionRhythm');
const { computeCourseActivityTrend } = require('./courseActivityTrend');
const { computePulseSummary } = require('./pulseSummary');

/**
 * Runs the full rule-based academic-pattern analyzer (Component A) over one
 * student's permitted data and returns all four indicators together.
 *
 * This function takes plain, already-fetched data — it knows nothing about
 * Canvas, Supabase, or HTTP. That's deliberate: keeping it a pure function
 * means it's trivially unit-testable with synthetic fixtures, and later
 * wiring it to a real Canvas connector is a thin adapter, not a rewrite.
 *
 * @param {object} input
 * @param {Array} input.assignments - see deadlinePressure.js for shape
 * @param {Array} input.submissions - see submissionRhythm.js for shape
 * @param {Array} input.courseActivity - see courseActivityTrend.js for shape
 * @param {boolean} [input.activityTrackingEnabled=true] - student's own toggle
 * @param {{now?: Date}} [options]
 */
function analyzeStudentPatterns(input, options = {}) {
  const deadlinePressure = computeDeadlinePressure(input.assignments, { now: options.now });
  const submissionRhythm = computeSubmissionRhythm(input.submissions);
  const courseActivityTrend = computeCourseActivityTrend(input.courseActivity, {
    enabled: input.activityTrackingEnabled ?? true,
  });
  const pulseSummary = computePulseSummary({ deadlinePressure, submissionRhythm, courseActivityTrend });

  return {
    generatedAt: (options.now ?? new Date()).toISOString(),
    deadlinePressure,
    submissionRhythm,
    courseActivityTrend,
    pulseSummary,
  };
}

module.exports = {
  analyzeStudentPatterns,
  computeDeadlinePressure,
  computeSubmissionRhythm,
  computeCourseActivityTrend,
  computePulseSummary,
};
