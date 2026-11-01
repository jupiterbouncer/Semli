const { ACTIVITY_TREND_MIN_SAMPLE, ACTIVITY_DROP_THRESHOLD_PCT } = require('./constants');
const { round2 } = require('./util');

/**
 * Summarizes changes in course activity, where reliable permitted data is
 * available. This indicator is OPTIONAL by design: page views are an
 * imperfect measure of learning or engagement, and the brief is explicit
 * that low activity does not necessarily indicate difficulty. The caveat
 * is returned alongside the result, not left to the caller to remember.
 *
 * @param {Array<{courseId: string, courseName: string, recentCount: number, baselineCount: number, sampleSize: number}>} courseActivity
 * @param {{enabled?: boolean, minSample?: number, dropThresholdPct?: number}} [options]
 */
function computeCourseActivityTrend(courseActivity, options = {}) {
  const enabled = options.enabled ?? true;
  const minSample = options.minSample ?? ACTIVITY_TREND_MIN_SAMPLE;
  const dropThresholdPct = options.dropThresholdPct ?? ACTIVITY_DROP_THRESHOLD_PCT;

  if (!enabled) {
    return {
      indicator: 'courseActivityTrend',
      status: 'disabled',
      summary: 'Course activity tracking is turned off.',
      observations: [],
    };
  }

  // Only report on courses with enough data points to say anything
  // meaningful, and a non-zero baseline (otherwise a % change is undefined).
  const eligible = courseActivity.filter((c) => c.sampleSize >= minSample && c.baselineCount > 0);

  const pctChange = (c) => ((c.recentCount - c.baselineCount) / c.baselineCount) * 100;

  const dropped = eligible
    .filter((c) => pctChange(c) <= -dropThresholdPct)
    .map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      pctChange: round2(pctChange(c)),
    }));

  const summary =
    dropped.length === 0
      ? 'No notable drop in recorded course activity.'
      : `Recorded activity in ${dropped.length} course${dropped.length === 1 ? '' : 's'} is lower than your recent baseline.`;

  return {
    indicator: 'courseActivityTrend',
    status: eligible.length === 0 ? 'insufficient-data' : 'ok',
    droppedCourses: dropped,
    summary,
    caveat:
      'Page views and activity counts are an imperfect measure of learning or engagement. Low activity does not necessarily indicate difficulty.',
    observations: eligible.map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      recentCount: c.recentCount,
      baselineCount: c.baselineCount,
    })),
  };
}

module.exports = { computeCourseActivityTrend };
