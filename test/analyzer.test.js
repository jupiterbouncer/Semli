const {
  analyzeStudentPatterns,
  computeDeadlinePressure,
  computeSubmissionRhythm,
  computeCourseActivityTrend,
  computePulseSummary,
} = require('../src/analyzer');

const NOW = new Date('2026-10-27T09:00:00Z'); // a Tuesday, for deterministic tests
const daysFromNow = (n) => new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000).toISOString();

describe('computeDeadlinePressure', () => {
  test('reports steady when there are no upcoming assignments', () => {
    const result = computeDeadlinePressure([], { now: NOW });
    expect(result.count).toBe(0);
    expect(result.level).toBe('steady');
    expect(result.summary).toMatch(/No assignments due/);
  });

  test('ignores assignments outside the window', () => {
    const assignments = [
      { id: 'a1', name: 'Essay', dueAt: daysFromNow(10) }, // outside 5-day window
      { id: 'a2', name: 'Quiz', dueAt: daysFromNow(-1) }, // already past
    ];
    const result = computeDeadlinePressure(assignments, { now: NOW });
    expect(result.count).toBe(0);
  });

  test('crosses into moderate exactly at the threshold (3)', () => {
    const assignments = [1, 2, 3].map((i) => ({ id: `a${i}`, name: `Task ${i}`, dueAt: daysFromNow(1) }));
    const result = computeDeadlinePressure(assignments, { now: NOW });
    expect(result.count).toBe(3);
    expect(result.level).toBe('moderate');
  });

  test('crosses into high exactly at the threshold (5)', () => {
    const assignments = [1, 2, 3, 4, 5].map((i) => ({ id: `a${i}`, name: `Task ${i}`, dueAt: daysFromNow(2) }));
    const result = computeDeadlinePressure(assignments, { now: NOW });
    expect(result.level).toBe('high');
  });

  test('flags days with more than one assignment due', () => {
    const sameDay = daysFromNow(2);
    const assignments = [
      { id: 'a1', name: 'A', dueAt: sameDay },
      { id: 'a2', name: 'B', dueAt: sameDay },
      { id: 'a3', name: 'C', dueAt: daysFromNow(4) },
    ];
    const result = computeDeadlinePressure(assignments, { now: NOW });
    expect(result.overlappingDays).toHaveLength(1);
    expect(result.overlappingDays[0].count).toBe(2);
  });
});

describe('computeSubmissionRhythm', () => {
  test('reports insufficient-data when history is too short', () => {
    const submissions = [
      { id: 's1', dueAt: daysFromNow(-10), submittedAt: daysFromNow(-10), status: 'on_time' },
    ];
    const result = computeSubmissionRhythm(submissions);
    expect(result.status).toBe('insufficient-data');
  });

  test('detects a later-than-usual recent pattern', () => {
    // Baseline: 6 submissions right on time (lag ~0 days).
    const baseline = Array.from({ length: 6 }, (_, i) => ({
      id: `b${i}`,
      dueAt: daysFromNow(-30 + i),
      submittedAt: daysFromNow(-30 + i),
      status: 'on_time',
    }));
    // Recent: 3 submissions running ~2 days late.
    const recent = Array.from({ length: 3 }, (_, i) => ({
      id: `r${i}`,
      dueAt: daysFromNow(-5 + i),
      submittedAt: daysFromNow(-5 + i + 2),
      status: 'late',
    }));
    const result = computeSubmissionRhythm([...baseline, ...recent]);
    expect(result.status).toBe('ok');
    expect(result.changed).toBe(true);
    expect(result.summary).toMatch(/later than your usual pattern/);
  });

  test('does not flag a pattern that is in line with baseline', () => {
    const all = Array.from({ length: 9 }, (_, i) => ({
      id: `x${i}`,
      dueAt: daysFromNow(-20 + i * 2),
      submittedAt: daysFromNow(-20 + i * 2), // always exactly on time
      status: 'on_time',
    }));
    const result = computeSubmissionRhythm(all);
    expect(result.changed).toBe(false);
  });

  test('excludes missing submissions from the lag calculation', () => {
    const baseline = Array.from({ length: 5 }, (_, i) => ({
      id: `b${i}`,
      dueAt: daysFromNow(-30 + i),
      submittedAt: daysFromNow(-30 + i),
      status: 'on_time',
    }));
    const recent = Array.from({ length: 3 }, (_, i) => ({
      id: `r${i}`,
      dueAt: daysFromNow(-5 + i),
      submittedAt: daysFromNow(-5 + i),
      status: 'on_time',
    }));
    const missing = [{ id: 'm1', dueAt: daysFromNow(-2), submittedAt: null, status: 'missing' }];
    const result = computeSubmissionRhythm([...baseline, ...recent, ...missing]);
    expect(result.status).toBe('ok');
    // The missing submission should not have been counted toward either window.
    expect(result.observations).toHaveLength(3);
  });
});

describe('computeCourseActivityTrend', () => {
  const courses = [
    { courseId: 'c1', courseName: 'Intro to CS', recentCount: 5, baselineCount: 20, sampleSize: 10 },
    { courseId: 'c2', courseName: 'Calculus II', recentCount: 18, baselineCount: 20, sampleSize: 10 },
  ];

  test('respects the disabled flag and does no computation', () => {
    const result = computeCourseActivityTrend(courses, { enabled: false });
    expect(result.status).toBe('disabled');
    expect(result.observations).toHaveLength(0);
  });

  test('flags a course with a drop at or beyond the threshold', () => {
    const result = computeCourseActivityTrend(courses, { enabled: true });
    expect(result.droppedCourses).toHaveLength(1);
    expect(result.droppedCourses[0].courseId).toBe('c1');
  });

  test('always includes the reliability caveat', () => {
    const result = computeCourseActivityTrend(courses, { enabled: true });
    expect(result.caveat).toMatch(/imperfect measure/);
  });

  test('excludes courses below the minimum sample size', () => {
    const thin = [{ courseId: 'c3', courseName: 'New Seminar', recentCount: 1, baselineCount: 10, sampleSize: 1 }];
    const result = computeCourseActivityTrend(thin, { enabled: true, minSample: 3 });
    expect(result.status).toBe('insufficient-data');
  });
});

describe('computePulseSummary', () => {
  test('is steady when nothing is flagged', () => {
    const result = computePulseSummary({
      deadlinePressure: { level: 'steady' },
      submissionRhythm: { status: 'ok', changed: false },
      courseActivityTrend: { status: 'ok', droppedCourses: [] },
    });
    expect(result.label).toBe('steady');
    expect(result.triggeredBy).toHaveLength(0);
  });

  test('is "more-to-manage" with exactly one signal', () => {
    const result = computePulseSummary({
      deadlinePressure: { level: 'high' },
      submissionRhythm: { status: 'ok', changed: false },
      courseActivityTrend: { status: 'ok', droppedCourses: [] },
    });
    expect(result.label).toBe('more-to-manage');
    expect(result.triggeredBy).toEqual(['deadlinePressure']);
  });

  test('is "consider-a-check-in" with two or more signals', () => {
    const result = computePulseSummary({
      deadlinePressure: { level: 'high' },
      submissionRhythm: { status: 'ok', changed: true },
      courseActivityTrend: { status: 'ok', droppedCourses: [] },
    });
    expect(result.label).toBe('consider-a-check-in');
    expect(result.triggeredBy).toEqual(['deadlinePressure', 'submissionRhythm']);
  });

  test('always carries the non-diagnostic disclaimer', () => {
    const result = computePulseSummary({
      deadlinePressure: { level: 'steady' },
      submissionRhythm: { status: 'ok', changed: false },
      courseActivityTrend: { status: 'ok', droppedCourses: [] },
    });
    expect(result.disclaimer).toMatch(/not your mental health/);
  });
});

describe('analyzeStudentPatterns (integration)', () => {
  test('runs all four indicators together and returns a consistent shape', () => {
    const input = {
      assignments: [
        { id: 'a1', name: 'Essay', dueAt: daysFromNow(1) },
        { id: 'a2', name: 'Quiz', dueAt: daysFromNow(2) },
      ],
      submissions: Array.from({ length: 8 }, (_, i) => ({
        id: `s${i}`,
        dueAt: daysFromNow(-30 + i * 3),
        submittedAt: daysFromNow(-30 + i * 3),
        status: 'on_time',
      })),
      courseActivity: [
        { courseId: 'c1', courseName: 'Intro to CS', recentCount: 5, baselineCount: 20, sampleSize: 10 },
      ],
      activityTrackingEnabled: true,
    };

    const result = analyzeStudentPatterns(input, { now: NOW });

    expect(result).toHaveProperty('generatedAt');
    expect(result.deadlinePressure.indicator).toBe('deadlinePressure');
    expect(result.submissionRhythm.indicator).toBe('submissionRhythm');
    expect(result.courseActivityTrend.indicator).toBe('courseActivityTrend');
    expect(result.pulseSummary.indicator).toBe('pulseSummary');
  });

  test('respects a student disabling activity tracking end-to-end', () => {
    const input = {
      assignments: [],
      submissions: [],
      courseActivity: [{ courseId: 'c1', courseName: 'X', recentCount: 1, baselineCount: 10, sampleSize: 5 }],
      activityTrackingEnabled: false,
    };
    const result = analyzeStudentPatterns(input, { now: NOW });
    expect(result.courseActivityTrend.status).toBe('disabled');
    // A disabled, data-less run should never be anything other than steady.
    expect(result.pulseSummary.label).toBe('steady');
  });
});
