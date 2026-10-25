import { useState } from 'react'
import Icon from './Icon'

export default function IndicatorAccordion({ indicators }) {
  const [openId, setOpenId] = useState(null)
  return <section className="indicators" aria-labelledby="indicators-title">
    <div className="section-heading section-heading--indicators"><div><p className="eyebrow">Understand the pattern</p><h2 id="indicators-title">Your indicators</h2></div><p className="section-hint">Based on sample data</p></div>
    <div className="accordion-list">
      {indicators.map((indicator) => {
        const open = openId === indicator.id
        return <article className={`indicator indicator--${indicator.tone} ${open ? 'indicator--open' : ''}`} key={indicator.id}>
          <button className="indicator__trigger" aria-expanded={open} aria-controls={`${indicator.id}-details`} onClick={() => setOpenId(open ? null : indicator.id)}>
            <span className="indicator__icon"><Icon name={indicator.kind} /></span>
            <span className="indicator__summary"><span className="indicator__title">{indicator.title}{indicator.optional && <span className="optional-label">Optional</span>}</span><span>{indicator.summary}</span></span>
            <Icon name="chevron" className="indicator__chevron" />
          </button>
          {open && <div className="indicator__details" id={`${indicator.id}-details`}>
            <div><h3>What this means</h3><p>{indicator.explanation}</p></div>
            <div><h3>What you can do</h3><ul>{indicator.actions.map((action) => <li key={action}>{action}</li>)}</ul></div>
            <a href="#recommendations" className="text-link">See relevant suggestions <span aria-hidden="true">→</span></a>
          </div>}
        </article>
      })}
    </div>
  </section>
}
