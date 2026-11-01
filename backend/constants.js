/**
 * Thresholds for the rule-based academic-pattern analyzer (Component A).
 *
 * These are intentionally explicit and named — not magic numbers buried in
 * logic — because the brief requires every indicator to be explainable.
 * A student (or reviewer) should be able to look at this file and see
 * exactly what triggers a change in what they're shown.
 */

module.exports = {
  // --- Deadline pressure ---
  // How many days ahead counts as "upcoming" for this indicator.
  DEADLINE_WINDOW_DAYS: 5,
  // Assignment counts within the window that bump the pressure level.
  DEADLINE_PRESSURE_THRESHOLDS: {
    MODERATE: 3, // 3 or more upcoming assignments
    HIGH: 5, // 5 or more upcoming assignments
  },

  // --- Submission rhythm ---
  // How many of the student's most recent submissions form the "recent" window.
  RHYTHM_LOOKBACK_COUNT: 3,
  // Minimum submissions needed *before* the recent window to form a reliable
  // personal baseline. Below this, we say so rather than guessing.
  RHYTHM_BASELINE_MIN_COUNT: 5,
  // How many days later (on average) the recent window must run, relative to
  // the student's own baseline, before we call it "later than usual."
  RHYTHM_LATE_THRESHOLD_DAYS: 1,

  // --- Course activity trend (optional, off by default in spirit) ---
  // Minimum activity samples a course needs before its trend is reported at all.
  ACTIVITY_TREND_MIN_SAMPLE: 3,
  // Percentage drop (recent vs. baseline) that counts as "lower activity."
  ACTIVITY_DROP_THRESHOLD_PCT: 30,
};
