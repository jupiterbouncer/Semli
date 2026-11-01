const days = [
  { label: 'Mon', value: 78 }, { label: 'Tue', value: 66 }, { label: 'Wed', value: 73 }, { label: 'Thu', value: 54 }, { label: 'Fri', value: 46, later: true }, { label: 'Sat', value: 56, later: true }, { label: 'Sun', value: 36, later: true },
]

export default function SubmissionChart() {
  return <section className="panel submission-chart" aria-labelledby="submission-chart-title">
    <div className="section-heading"><div><p className="eyebrow">Academic pattern · sample</p><h2 id="submission-chart-title">Submission timing</h2></div><span className="chart-legend"><span /> Later than your sample baseline</span></div>
    <div className="bar-chart" role="img" aria-label="Sample submission timing for a seven day period. Friday through Sunday are marked later than the sample baseline.">
      {days.map((day) => <div className="bar-chart__item" key={day.label}><span className={day.later ? 'bar-chart__bar bar-chart__bar--later' : 'bar-chart__bar'} style={{ height: `${day.value}%` }} /><span>{day.label}</span></div>)}
    </div>
  </section>
}
