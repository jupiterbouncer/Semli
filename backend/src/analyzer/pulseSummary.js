/**
 * Combines the three indicators into one of three plain-language labels:
 * Steady / More to manage / Consider a check-in.
 *
 * This is deliberately a simple counting rule over already-computed
 * indicators — NOT a model, NOT a score, and it never sees raw Canvas
 * data directly. That keeps it auditable: `triggeredBy` always says
 * exactly which indicators produced the label, so nothing is a black box.
 *
 * Per the brief, this label describes academic patterns, not a clinical
 * or psychological condition — the disclaimer travels with the result
 * rather than living only in a UI string someone could forget to show.
 *
 * @param {{deadlinePressure: object, submissionRhythm: object, courseActivityTrend: object}} indicators
 */
function computePulseSummary({ deadlinePressure, submissionRhythm, courseActivityTrend }) {
  const signals = [];

  if (deadlinePressure && (deadlinePressure.level === 'moderate' || deadlinePressure.level === 'high')) {
    signals.push('deadlinePressure');
  }
  if (submissionRhythm && submissionRhythm.status === 'ok' && submissionRhythm.changed) {
    signals.push('submissionRhythm');
  }
  if (
    courseActivityTrend &&
    courseActivityTrend.status === 'ok' &&
    courseActivityTrend.droppedCourses.length > 0
  ) {
    signals.push('courseActivityTrend');
  }

  let label = 'steady';
  if (signals.length >= 2) label = 'consider-a-check-in';
  else if (signals.length === 1) label = 'more-to-manage';

  const labelText = {
    steady: 'Steady',
    'more-to-manage': 'More to manage',
    'consider-a-check-in': 'Consider a check-in',
  }[label];

  return {
    indicator: 'pulseSummary',
    label, // 'steady' | 'more-to-manage' | 'consider-a-check-in'
    labelText,
    triggeredBy: signals,
    disclaimer: 'This label describes academic patterns, not your mental health.',
  };
}

module.exports = { computePulseSummary };
