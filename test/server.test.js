const { handleGetPatterns, handleGetRecommendations } = require('../src/server/handlers');
const { createCatalogue, SEED_RESOURCES } = require('../src/recommender/resourceCatalogue');
const { createCache } = require('../src/recommender/cache');
const { createUsageTracker } = require('../src/recommender/usageTracker');
const { createAiClient } = require('../src/recommender/aiClient');

function mockCanvasProvider(overrides = {}) {
  return {
    async getStudentData(studentId) {
      return {
        assignments: [],
        submissions: [],
        courseActivity: [],
        activityTrackingEnabled: true,
        ...overrides,
      };
    },
  };
}

describe('handleGetPatterns', () => {
  test('400 when studentId is missing', async () => {
    const result = await handleGetPatterns({ studentId: undefined, canvasProvider: mockCanvasProvider() });
    expect(result.status).toBe(400);
  });

  test('200 with a full analyzer result for a valid student', async () => {
    const result = await handleGetPatterns({ studentId: 'u1', canvasProvider: mockCanvasProvider() });
    expect(result.status).toBe(200);
    expect(result.body.deadlinePressure.indicator).toBe('deadlinePressure');
    expect(result.body.pulseSummary.indicator).toBe('pulseSummary');
  });
});

describe('handleGetRecommendations', () => {
  function makeRecommenderDeps(generateFn) {
    return {
      catalogue: createCatalogue(SEED_RESOURCES),
      cache: createCache(),
      usageTracker: createUsageTracker(),
      aiClient: createAiClient({ generateFn }),
      budget: { maxTokensPerStudentPerDay: 10000 },
    };
  }

  test('400 when required fields are missing', async () => {
    const result = await handleGetRecommendations({
      studentId: 'u1',
      // trigger and date omitted
      canvasProvider: mockCanvasProvider(),
      recommenderDeps: makeRecommenderDeps(async () => ({ picks: [], tokensUsed: 0, modelTier: 'reasoning' })),
    });
    expect(result.status).toBe(400);
  });

  test('200 with AI-sourced recommendations on the happy path', async () => {
    const generateFn = async ({ candidateResources }) => ({
      picks: [{ resourceId: candidateResources[0].id, explanation: 'x' }],
      tokensUsed: 100,
      modelTier: 'reasoning',
    });
    const result = await handleGetRecommendations({
      studentId: 'u1',
      trigger: 'deadline-cluster',
      date: '2026-10-27',
      filter: { type: 'academic' },
      canvasProvider: mockCanvasProvider(),
      recommenderDeps: makeRecommenderDeps(generateFn),
    });
    expect(result.status).toBe(200);
    expect(result.body.source).toBe('ai');
    expect(result.body.recommendations.length).toBeGreaterThan(0);
  });

  test('falls back to the analyzer pulse summary when the AI budget is exhausted', async () => {
    const deps = makeRecommenderDeps(async () => ({ picks: [], tokensUsed: 0, modelTier: 'reasoning' }));
    deps.usageTracker.recordUsage('u1', { tokens: 10000 }); // exhaust budget before the call

    const result = await handleGetRecommendations({
      studentId: 'u1',
      trigger: 'deadline-cluster',
      date: '2026-10-27',
      filter: { type: 'academic' },
      canvasProvider: mockCanvasProvider(), // empty data -> steady pulse
      recommenderDeps: deps,
    });

    expect(result.status).toBe(200);
    expect(result.body.source).toBe('fallback-rule-based');
    // This is the actual A <-> C integration point: the fallback is
    // Component A's real pulseSummary output, not a hardcoded string.
    expect(result.body.fallback.indicator).toBe('pulseSummary');
    expect(result.body.fallback.label).toBe('steady');
  });
});
