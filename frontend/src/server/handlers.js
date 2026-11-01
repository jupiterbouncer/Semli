const { analyzeStudentPatterns } = require('../analyzer');
const { getRecommendations } = require('../recommender');

/**
 * These handlers take plain input and return { status, body } — no
 * Express req/res anywhere in this file. That's deliberate: it means
 * the actual request-handling logic can be unit-tested with nothing
 * but Node's built-in `assert`, same as analyzer/ and recommender/,
 * without needing Express (or any framework) installed. app.js is the
 * thin binding layer that connects these to real HTTP.
 */

/**
 * GET /api/patterns — runs Component A over one student's data.
 *
 * @param {{studentId: string, canvasProvider: object}} args
 */
async function handleGetPatterns({ studentId, canvasProvider }) {
  if (!studentId) {
    return { status: 400, body: { error: 'studentId is required' } };
  }

  const data = await canvasProvider.getStudentData(studentId);
  const result = analyzeStudentPatterns(data);
  return { status: 200, body: result };
}

/**
 * POST /api/recommendations — runs Component C for one triggering context.
 * This is where Component A and C actually connect: the fallback used
 * when the AI budget is exhausted is Component A's pulse summary for
 * that same student, fetched fresh via the same canvasProvider.
 *
 * @param {object} args
 * @param {string} args.studentId
 * @param {string} args.trigger
 * @param {object} [args.signals]
 * @param {string} args.date
 * @param {object} [args.filter]
 * @param {object} args.canvasProvider
 * @param {object} args.recommenderDeps - { catalogue, cache, usageTracker, aiClient, budget }
 */
async function handleGetRecommendations({
  studentId,
  trigger,
  signals,
  date,
  filter,
  canvasProvider,
  recommenderDeps,
}) {
  if (!studentId || !trigger || !date) {
    return { status: 400, body: { error: 'studentId, trigger, and date are required' } };
  }

  const context = { studentId, trigger, signals: signals || {}, date, filter };

  const fallbackProvider = async (ctx) => {
    const data = await canvasProvider.getStudentData(ctx.studentId);
    const patterns = analyzeStudentPatterns(data);
    return patterns.pulseSummary;
  };

  const result = await getRecommendations({ context, ...recommenderDeps, fallbackProvider });
  return { status: 200, body: result };
}

module.exports = { handleGetPatterns, handleGetRecommendations };
