export const weekDays = [
  { label: 'Mon', value: 35 },
  { label: 'Tue', value: 51 },
  { label: 'Wed', value: 43 },
  { label: 'Thu', value: 63 },
  { label: 'Fri', value: 79, highlight: true },
  { label: 'Sat', value: 41 },
  { label: 'Sun', value: 38 },
]

export const indicators = [
  {
    id: 'deadline-pressure',
    kind: 'calendar',
    tone: 'amber',
    title: 'Deadline pressure',
    summary: '4 assignments are due in the next 5 days',
    explanation:
      'Four upcoming course tasks are grouped within the next five days. This is a workload summary based on sample due dates, not a judgement about how you are coping.',
    actions: ['Review the due dates and break the next task into a first step.', 'Set aside a planning block for the work due this week.'],
  },
  {
    id: 'submission-rhythm',
    kind: 'clock',
    tone: 'plum',
    title: 'Submission rhythm',
    summary: 'Your last 3 recorded submissions were later than your recent pattern',
    explanation:
      'This compares recent recorded submission times with a personal pattern in this demo. A later submission by itself does not say anything about your wellbeing.',
    actions: ['Choose one upcoming task to start earlier this week.', 'Open the study-planning guide for a shorter task breakdown.'],
  },
  {
    id: 'course-activity',
    kind: 'book',
    tone: 'moss',
    title: 'Course activity',
    optional: true,
    summary: 'Recorded activity is lower in 2 courses this week',
    explanation:
      'Activity data is optional and only useful where it is available and reliable. It cannot measure learning, effort, or wellbeing on its own.',
    actions: ['Check whether the course materials you need are easy to find.', 'You can turn this indicator off at any time in preferences.'],
  },
]

export const recommendations = {
  academic: [
    { title: 'Plan a busy week in 15 minutes', meta: 'Study planning' },
    { title: 'CS 301 office hours', meta: 'Thursday · 2:00 PM' },
  ],
  optional: [
    { title: 'Take a short break between classes', meta: 'Optional reset' },
    { title: 'Explore campus support options', meta: 'Student support' },
  ],
}
