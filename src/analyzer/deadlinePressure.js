const { DEADLINE_WINDOW_DAYS, DEADLINE_PRESSURE_THRESHOLDS } = require('./constants');

/**
 * Summarizes upcoming assignment deadlines, overlapping tasks, and the
 * amount of work scheduled within a selected period.
 *
 * This indicator is pure counting + grouping — no inference, no model.
 * Matches the brief's example: "You have four assignments due within the
 * next five days."
 *
 * @param {Array<{id: string, name: string, dueAt: string}>} assignments
 * @param {{windowDays?: number, now?: Date}} [options]
 */
function computeDeadlinePressure(assignments, options = {}) {
  const windowDays = options.windowDays ?? DEADLINE_WINDOW_DAYS;
  const now = options.now ?? new Date();
  const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  const upcoming = assignments
    .filter((a) => a.dueAt)
    .filter((a) => {
      const due = new Date(a.dueAt);
      return due >= now && due <= windowEnd;
    })
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  const count = upcoming.length;

  // Group by calendar day to surface genuinely overlapping deadlines,
  // not just "a busy week" — a student can plan around five assignments
  // spread across five days more easily than three due the same day.
  const byDay = {};
  for (const a of upcoming) {
    const day = new Date(a.dueAt).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }
  const overlappingDays = Object.entries(byDay)
    .filter(([, c]) => c > 1)
    .map(([day, c]) => ({ day, count: c }));

  let level = 'steady';
  if (count >= DEADLINE_PRESSURE_THRESHOLDS.HIGH) level = 'high';
  else if (count >= DEADLINE_PRESSURE_THRESHOLDS.MODERATE) level = 'moderate';

  const summary =
    count === 0
      ? `No assignments due in the next ${windowDays} days.`
      : `You have ${count} assignment${count === 1 ? '' : 's'} due in the next ${windowDays} days.`;

  return {
    indicator: 'deadlinePressure',
    windowDays,
    count,
    level, // 'steady' | 'moderate' | 'high'
    overlappingDays,
    summary,
    // The actual records behind the number, so the UI can show "why" on expand.
    observations: upcoming.map((a) => ({ id: a.id, name: a.name, dueAt: a.dueAt })),
  };
}

module.exports = { computeDeadlinePressure };
