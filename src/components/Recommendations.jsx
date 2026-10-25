import Icon from './Icon'

function RecommendationColumn({ title, items, icon }) {
  return <div className="recommendation-column"><div className="recommendation-column__heading"><span><Icon name={icon} size={16} /></span><h3>{title}</h3></div><ul>{items.map((item) => <li key={item.title}><a href="#"><strong>{item.title}</strong><span>{item.meta}</span><Icon name="chevron" size={17} /></a></li>)}</ul></div>
}

export default function Recommendations({ recommendations }) {
  return <section className="recommendations" id="recommendations" aria-labelledby="recommendations-title">
    <div className="recommendations__heading"><div><p className="eyebrow">Chosen for this sample week</p><h2 id="recommendations-title">Recommended for you</h2></div><a href="#" className="text-link">Browse all <span aria-hidden="true">→</span></a></div>
    <p className="recommendations__intro">Suggestions are examples for this prototype. In the live product, they should come from verified course and university resources.</p>
    <div className="recommendation-grid"><RecommendationColumn title="Academic" items={recommendations.academic} icon="book" /><RecommendationColumn title="If you’d like" items={recommendations.optional} icon="compass" /></div>
  </section>
}
