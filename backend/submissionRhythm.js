const {
  RHYTHM_LOOKBACK_COUNT,
  RHYTHM_BASELINE_MIN_COUNT,
  RHYTHM_LATE_THRESHOLD_DAYS,
} = require('./constants');
const { average, round2, daysBetween } = require('./util');

/**
 * Shows changes in submission timing relative to the student's OWN recent
 * pattern — never against a class average or an absolute "lateness" score.
 * Comparing a student only to themselves avoids penalizing naturally
 * different working styles.
 *
 * Matches the brief's example: "Your last three submissions were later
 * than your usual pattern."
 *
 * @param {Array<{id: string, dueAt: string, submittedAt: string, status: 'on_time'|'late'|'missing'}>} submissions
 * @param {{lookbackCount?: number, baselineMinCount?: number, lateThresholdDays?: number}} [options]
 */
function computeSubmissionRhythm(submissions, options = {}) {
  const lookbackCount = options.lookbackCount ?? RHYTHM_LOOKBACK_COUNT;
  const baselineMinCount = options.baselineMinCount ?? RHYTHM_BASELINE_MIN_COUNT;
  const lateThresholdDays = options.lateThresholdDays ?? RHYTHM_LATE_THRESHOLD_DAYS;

  // Missing submissions have no submittedAt and would distort a lag
  // calculation, so they're excluded from the timing comparison here.
  // (A missing-submission signal would be a separate, explicit indicator —
  // not silently folded into "late.")
  const timed = submissions
    .filter((s) => s.dueAt && s.submittedAt && s.status !== 'missing')
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  if (timed.length < baselineMinCount + lookbackCount) {
    return {
      indicator: 'submissionRhythm',
      status: 'insufficient-data',
      summary: 'Not enough submission history yet to compare your recent pattern.',
      observations: [],
    };
  }

  const lagDays = (s) => daysBetween(s.dueAt, s.submittedAt);

  const recent = timed.slice(-lookbackCount);
  const baselinePool = timed.slice(0, -lookbackCount);

  const baselineAvgLag = average(baselinePool.map(lagDays));
  const recentAvgLag = average(recent.map(lagDays));
  const delta = recentAvgLag - baselineAvgLag;
  const changed = delta >= lateThresholdDays;

  const summary = changed
    ? `Your last ${lookbackCount} submissions ran later than your usual pattern.`
    : 'Your recent submissions are in line with your usual pattern.';

  return {
    indicator: 'submissionRhythm',
    status: 'ok',
    changed,
    baselineAvgLagDays: round2(baselineAvgLag),
    recentAvgLagDays: round2(recentAvgLag),
    deltaDays: round2(delta),
    summary,
    observations: recent.map((s) => ({
      id: s.id,
      dueAt: s.dueAt,
      submittedAt: s.submittedAt,
      lagDays: round2(lagDays(s)),
    })),
  };
}

module.exports = { computeSubmissionRhythm };
