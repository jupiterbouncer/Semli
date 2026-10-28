const { createCatalogue, SEED_RESOURCES } = require('../src/recommender/resourceCatalogue');
const { createCache, buildContextKey } = require('../src/recommender/cache');
const { createUsageTracker } = require('../src/recommender/usageTracker');
const { createAiClient } = require('../src/recommender/aiClient');
const { validateRecommendations } = require('../src/recommender/validator');
const { createFeedbackStore } = require('../src/recommender/feedback');
const { getRecommendations } = require('../src/recommender/recommend');

describe('resourceCatalogue', () => {
  const catalogue = createCatalogue(SEED_RESOURCES);

  test('getById returns the matching resource', () => {
    expect(catalogue.getById('res-planning-guide').title).toMatch(/Study planning guide/);
  });

  test('getById returns undefined for an unknown id', () => {
    expect(catalogue.getById('does-not-exist')).toBeUndefined();
  });

  test('filter by type', () => {
    const academic = catalogue.filter({ type: 'academic' });
    expect(academic.length).toBe(2);
    expect(academic.every((r) => r.type === 'academic')).toBe(true);
  });

  test('filter by tags matches any overlap', () => {
    const planningRelated = catalogue.filter({ tags: ['planning'] });
    expect(planningRelated.map((r) => r.id)).toContain('res-planning-guide');
  });

  test('hasAll is true only when every id exists', () => {
    expect(catalogue.hasAll(['res-planning-guide', 'res-breathing-exercise'])).toBe(true);
    expect(catalogue.hasAll(['res-planning-guide', 'fake-id'])).toBe(false);
  });
});

describe('cache key building', () => {
  test('same context produces the same key regardless of property order', () => {
    const a = { studentId: 'u1', trigger: 'deadline-cluster', date: '2026-10-27', signals: { count: 4, level: 'high' } };
    const b = { studentId: 'u1', trigger: 'deadline-cluster', date: '2026-10-27', signals: { level: 'high', count: 4 } };
    expect(buildContextKey(a)).toBe(buildContextKey(b));
  });

  test('a different date produces a different key', () => {
    const a = { studentId: 'u1', trigger: 'deadline-cluster', date: '2026-10-27', signals: {} };
    const b = { studentId: 'u1', trigger: 'deadline-cluster', date: '2026-10-28', signals: {} };
    expect(buildContextKey(a)).not.toBe(buildContextKey(b));
  });

  test('a different student produces a different key', () => {
    const a = { studentId: 'u1', trigger: 'x', date: '2026-10-27', signals: {} };
    const b = { studentId: 'u2', trigger: 'x', date: '2026-10-27', signals: {} };
    expect(buildContextKey(a)).not.toBe(buildContextKey(b));
  });
});

describe('usageTracker', () => {
  test('is within budget with no usage recorded', () => {
    const tracker = createUsageTracker();
    expect(tracker.isWithinBudget('u1', { maxTokensPerStudentPerDay: 1000 })).toBe(true);
  });

  test('blocks once the per-student budget is reached', () => {
    const tracker = createUsageTracker();
    tracker.recordUsage('u1', { tokens: 1000 });
    expect(tracker.isWithinBudget('u1', { maxTokensPerStudentPerDay: 1000 })).toBe(false);
  });

  test('a different student is unaffected by another student exhausting their budget', () => {
    const tracker = createUsageTracker();
    tracker.recordUsage('u1', { tokens: 1000 });
    expect(tracker.isWithinBudget('u2', { maxTokensPerStudentPerDay: 1000 })).toBe(true);
  });

  test('blocks once the aggregate budget is reached, even under the per-student cap', () => {
    const tracker = createUsageTracker();
    tracker.recordUsage('u1', { tokens: 500 });
    tracker.recordUsage('u2', { tokens: 500 });
    expect(tracker.isWithinBudget('u3', { maxAggregateTokensPerDay: 1000, maxTokensPerStudentPerDay: 5000 })).toBe(false);
  });
});

describe('validateRecommendations', () => {
  const candidates = [
    { id: 'res-a', title: 'A' },
    { id: 'res-b', title: 'B' },
  ];

  test('accepts picks that reference a retrieved candidate', () => {
    const { valid, rejected } = validateRecommendations([{ resourceId: 'res-a', explanation: 'x' }], candidates);
    expect(valid).toHaveLength(1);
    expect(rejected).toHaveLength(0);
  });

  test('rejects a pick referencing a resource that was not retrieved (hallucination)', () => {
    const { valid, rejected } = validateRecommendations(
      [{ resourceId: 'res-a', explanation: 'x' }, { resourceId: 'res-fabricated', explanation: 'invented' }],
      candidates
    );
    expect(valid).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].resourceId).toBe('res-fabricated');
  });
});

describe('feedback store', () => {
  test('records valid feedback and summarizes per resource', () => {
    const store = createFeedbackStore();
    store.record({ studentId: 'u1', recommendationId: 'r1', resourceId: 'res-a', feedback: 'helpful' });
    store.record({ studentId: 'u2', recommendationId: 'r2', resourceId: 'res-a', feedback: 'not_relevant' });
    const summary = store.summaryForResource('res-a');
    expect(summary.helpful).toBe(1);
    expect(summary.not_relevant).toBe(1);
    expect(summary.total).toBe(2);
  });

  test('rejects an unknown feedback type', () => {
    const store = createFeedbackStore();
    expect(() =>
      store.record({ studentId: 'u1', recommendationId: 'r1', resourceId: 'res-a', feedback: 'love_it' })
    ).toThrow();
  });
});

describe('getRecommendations (full orchestration)', () => {
  const baseContext = {
    studentId: 'u1',
    trigger: 'deadline-cluster',
    date: '2026-10-27',
    signals: { level: 'high' },
    filter: { type: 'academic' },
  };

  function makeDeps(generateFn) {
    return {
      catalogue: createCatalogue(SEED_RESOURCES),
      cache: createCache(),
      usageTracker: createUsageTracker(),
      aiClient: createAiClient({ generateFn }),
      fallbackProvider: (ctx) => ({ summary: `Rule-based summary for ${ctx.studentId}` }),
      budget: { maxTokensPerStudentPerDay: 10000 },
    };
  }

  test('happy path returns validated AI recommendations', async () => {
    let callCount = 0;
    const generateFn = async ({ candidateResources }) => {
      callCount++;
      return {
        picks: [{ resourceId: candidateResources[0].id, explanation: 'Matches your upcoming deadlines.' }],
        tokensUsed: 120,
        modelTier: 'reasoning',
      };
    };
    const deps = makeDeps(generateFn);
    const result = await getRecommendations({ context: baseContext, ...deps });

    expect(result.source).toBe('ai');
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].title).toMatch(/Study planning guide|Office Hours/);
    expect(callCount).toBe(1);
  });

  test('a repeated identical context is served from cache without a second AI call', async () => {
    let callCount = 0;
    const generateFn = async ({ candidateResources }) => {
      callCount++;
      return { picks: [{ resourceId: candidateResources[0].id, explanation: 'x' }], tokensUsed: 100, modelTier: 'reasoning' };
    };
    const deps = makeDeps(generateFn);

    await getRecommendations({ context: baseContext, ...deps });
    const second = await getRecommendations({ context: baseContext, ...deps });

    expect(callCount).toBe(1); // the AI client was only ever invoked once
    expect(second.source).toBe('cache');
  });

  test('exceeded budget falls back to the rule-based provider with no AI call', async () => {
    let callCount = 0;
    const generateFn = async () => {
      callCount++;
      return { picks: [], tokensUsed: 0, modelTier: 'reasoning' };
    };
    const deps = makeDeps(generateFn);
    deps.usageTracker.recordUsage('u1', { tokens: 10000 }); // exhaust the budget up front

    const result = await getRecommendations({ context: baseContext, ...deps });

    expect(callCount).toBe(0);
    expect(result.source).toBe('fallback-rule-based');
    expect(result.fallback.summary).toMatch(/Rule-based summary/);
  });

  test('a hallucinated pick is filtered out of the final recommendations', async () => {
    const generateFn = async ({ candidateResources }) => ({
      picks: [
        { resourceId: candidateResources[0].id, explanation: 'real one' },
        { resourceId: 'res-totally-made-up', explanation: 'invented by the model' },
      ],
      tokensUsed: 150,
      modelTier: 'reasoning',
    });
    const deps = makeDeps(generateFn);
    const result = await getRecommendations({ context: baseContext, ...deps });

    expect(result.recommendations).toHaveLength(1);
    expect(result.rejectedCount).toBe(1);
  });

  test('no matching resources returns empty without calling the AI client', async () => {
    let callCount = 0;
    const generateFn = async () => {
      callCount++;
      return { picks: [], tokensUsed: 0, modelTier: 'reasoning' };
    };
    const deps = makeDeps(generateFn);
    const noMatchContext = { ...baseContext, filter: { type: 'nonexistent-type' } };

    const result = await getRecommendations({ context: noMatchContext, ...deps });

    expect(callCount).toBe(0);
    expect(result.recommendations).toHaveLength(0);
  });
});
