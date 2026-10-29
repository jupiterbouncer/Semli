const { createApp } = require('./app');
const { createSyntheticCanvasProvider } = require('../canvas/syntheticProvider');
const { createDefaultRecommenderDeps } = require('../recommender');

const canvasProvider = createSyntheticCanvasProvider();

// TODO (Stage 4 follow-up): replace this stub generateFn with a real AI
// provider call. It's wired this way so the whole stack — handlers,
// Express routes, caching, budget checks — is runnable and testable
// end-to-end today, without an API key.
const recommenderDeps = createDefaultRecommenderDeps({
  generateFn: async ({ candidateResources }) => ({
    picks: candidateResources
      .slice(0, 2)
      .map((r) => ({ resourceId: r.id, explanation: `Relevant to your current context: ${r.title}.` })),
    tokensUsed: 50,
    modelTier: 'summarization',
  }),
});

const app = createApp({ canvasProvider, recommenderDeps });
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Semli API listening on port ${PORT}`));
}

module.exports = { app };
