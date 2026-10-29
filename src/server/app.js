const express = require('express');
const { handleGetPatterns, handleGetRecommendations } = require('./handlers');

/**
 * Builds the Express app. Deliberately thin — every route just
 * translates req -> handler input and handler output -> res, with no
 * business logic of its own. The logic worth testing lives in
 * handlers.js, which doesn't depend on Express at all.
 *
 * @param {{canvasProvider: object, recommenderDeps: object}} deps
 */
function createApp({ canvasProvider, recommenderDeps }) {
  const app = express();
  app.use(express.json());

  app.get('/api/patterns', async (req, res, next) => {
    try {
      const { studentId } = req.query;
      const { status, body } = await handleGetPatterns({ studentId, canvasProvider });
      res.status(status).json(body);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/recommendations', async (req, res, next) => {
    try {
      const { studentId, trigger, signals, date, filter } = req.body || {};
      const { status, body } = await handleGetRecommendations({
        studentId,
        trigger,
        signals,
        date,
        filter,
        canvasProvider,
        recommenderDeps,
      });
      res.status(status).json(body);
    } catch (err) {
      next(err);
    }
  });

  // Centralized error handler. Keeps internal error detail out of the
  // response — logging it server-side is a TODO for when real
  // monitoring (§12) is wired in.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
