/**
 * Stand-in for the real Canvas connector (Stage 3 of the roadmap, not yet
 * built — gated on institutional OAuth app approval). This exists as its
 * own module, per §11: "Keep the trend analyzer, Canvas connector, AI
 * recommendation service, and resource catalogue as distinct modules."
 *
 * The interface — getStudentData(studentId) returning the shape
 * analyzer/index.js expects — is the real contract. When Stage 3 lands,
 * a new canvasOAuthProvider.js implementing this same interface against
 * the real Canvas API replaces this file; nothing in server/ or
 * analyzer/ needs to change.
 */
function createSyntheticCanvasProvider() {
  return {
    /**
     * @param {string} studentId
     * @returns {Promise<{assignments: Array, submissions: Array, courseActivity: Array, activityTrackingEnabled: boolean}>}
     */
    async getStudentData(studentId) {
      const now = new Date();
      const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000).toISOString();

      return {
        assignments: [
          { id: `${studentId}-a1`, name: 'Essay draft', dueAt: daysFromNow(1) },
          { id: `${studentId}-a2`, name: 'Problem set 4', dueAt: daysFromNow(2) },
          { id: `${studentId}-a3`, name: 'Lab report', dueAt: daysFromNow(4) },
        ],
        submissions: Array.from({ length: 8 }, (_, i) => ({
          id: `${studentId}-s${i}`,
          dueAt: daysFromNow(-30 + i * 3),
          submittedAt: daysFromNow(-30 + i * 3),
          status: 'on_time',
        })),
        courseActivity: [
          {
            courseId: 'course-101',
            courseName: 'Intro to Web Technologies',
            recentCount: 12,
            baselineCount: 15,
            sampleSize: 10,
          },
        ],
        activityTrackingEnabled: true,
      };
    },
  };
}

module.exports = { createSyntheticCanvasProvider };
