import { weekDays } from '../data/dashboardData'

export default function WeeklyRhythm() {
  const points = weekDays.map((day, index) => `${index * 16.66 + 1.5},${94 - day.value}`).join(' ')
  return <section className="panel rhythm" aria-labelledby="rhythm-title">
    <div className="section-heading"><div><p className="eyebrow">Week overview</p><h2 id="rhythm-title">This week’s rhythm</h2></div><span className="rhythm__key"><span /> Sample workload</span></div>
    <div className="rhythm__chart" role="img" aria-label="Sample workload rises through the week and reaches its highest point on Friday.">
      <svg viewBox="0 0 104 100" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6b8c78" stopOpacity=".18" /><stop offset="1" stopColor="#6b8c78" stopOpacity="0" /></linearGradient></defs><path d={`M ${points} L 101,100 L 1,100 Z`} fill="url(#area)" /><polyline points={points} fill="none" stroke="#557566" strokeWidth="1.35" vectorEffect="non-scaling-stroke" /></svg>
      <div className="rhythm__dots">{weekDays.map((day) => <span key={day.label} className={day.highlight ? 'rhythm__dot rhythm__dot--highlight' : 'rhythm__dot'} style={{ top: `${94 - day.value}%` }} />)}</div>
    </div>
    <div className="rhythm__labels" aria-hidden="true">{weekDays.map((day) => <span key={day.label}>{day.label}</span>)}</div>
    <p className="rhythm__caption">Friday has the most scheduled work in this sample week.</p>
  </section>
}
