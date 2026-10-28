/**
 * The vetted resource catalogue the AI is allowed to recommend from.
 *
 * Per the brief, the AI must never invent Canvas modules, university
 * services, or support contacts — it can only select, explain, or
 * summarize resources that actually exist here. This module is the
 * source of truth that the validator checks every AI response against.
 *
 * This is an in-memory implementation for development and testing.
 * A production version would back this with Postgres, but the shape
 * (getById / filter) is what the rest of the recommender depends on,
 * so swapping the storage layer later doesn't touch calling code.
 */

function createCatalogue(resources = []) {
  const byId = new Map(resources.map((r) => [r.id, r]));

  return {
    /** All resources currently in the catalogue. */
    all() {
      return [...byId.values()];
    },

    /** A single resource by id, or undefined if it doesn't exist. */
    getById(id) {
      return byId.get(id);
    },

    /**
     * Resources matching simple filters. Kept intentionally simple —
     * a real deployment would likely do this as a Postgres query with
     * proper indexing, but the matching *logic* (type/tag/course) is
     * what the recommender's context-matching depends on.
     */
    filter({ type, tags, courseId } = {}) {
      return [...byId.values()].filter((r) => {
        if (type && r.type !== type) return false;
        if (courseId && r.courseId !== courseId) return false;
        if (tags && tags.length > 0) {
          const hasAnyTag = tags.some((t) => (r.tags || []).includes(t));
          if (!hasAnyTag) return false;
        }
        return true;
      });
    },

    /** True if every id in `ids` exists in this catalogue. Used by the validator. */
    hasAll(ids) {
      return ids.every((id) => byId.has(id));
    },
  };
}

/**
 * A small seed catalogue for development/testing — the same four
 * resources used in the Discover screen mockup, for continuity.
 */
const SEED_RESOURCES = [
  {
    id: 'res-planning-guide',
    title: 'Study planning guide for busy weeks',
    type: 'academic',
    url: 'https://university.example.edu/resources/study-planning-guide',
    tags: ['planning', 'time-management', 'deadlines'],
    description: 'A short guide for breaking a busy week of deadlines into manageable steps.',
  },
  {
    id: 'res-cs301-office-hours',
    title: 'CS 301 Office Hours',
    type: 'academic',
    url: 'https://university.example.edu/courses/cs301/office-hours',
    courseId: 'cs301',
    tags: ['office-hours', 'cs301'],
    description: 'Thursday 2pm, CS 301 — drop-in help with current coursework.',
  },
  {
    id: 'res-breathing-exercise',
    title: 'Quick stress relief',
    type: 'wellbeing',
    url: 'https://university.example.edu/wellbeing/5-minute-breathing',
    tags: ['stress', 'break', 'short'],
    description: 'A 5-minute guided breathing exercise.',
  },
  {
    id: 'res-counselling-dropin',
    title: 'Campus mental health services',
    type: 'support',
    url: 'https://university.example.edu/counselling/drop-in',
    tags: ['counselling', 'support'],
    description: 'Drop-in counselling hours, no appointment needed.',
  },
];

module.exports = { createCatalogue, SEED_RESOURCES };
