import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import CategoryTabs from '../components/CategoryTabs'
import Icon from '../components/Icon'
import { resourceCategories, resources } from '../data/pageData'

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('academic')
  const [selected, setSelected] = useState(null)
  const visibleResources = resources.filter((resource) => resource.category === activeTab)
  return <><PageHeader title="Discover" description="Prototype suggestions for study goals and optional support." />
    <CategoryTabs categories={resourceCategories} active={activeTab} onChange={(tab) => { setActiveTab(tab); setSelected(null) }} label="Resource category" />
    <div id={`${activeTab}-panel`} role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
      <section className="resource-list" aria-label={`${activeTab} prototype resources`}><p className="resource-list__note">These are example cards. Production resources will use verified links and your preferences.</p>{visibleResources.map((resource) => <article className={`resource-card resource-card--${resource.tone} ${selected === resource.id ? 'resource-card--selected' : ''}`} key={resource.id}><button type="button" onClick={() => setSelected(selected === resource.id ? null : resource.id)} aria-expanded={selected === resource.id}><span className="resource-card__icon"><Icon name={resource.category === 'academic' ? 'book' : resource.category === 'activities' ? 'compass' : 'heart'} /></span><span className="resource-card__copy"><strong>{resource.title}</strong><span>{resource.detail}</span></span><span className="resource-card__tag">{resource.tag}</span><Icon name="chevron" className="resource-card__chevron" /></button>{selected === resource.id && <div className="resource-card__details">This prototype has no destination yet. A future release will show a verified link, why it was suggested, and a way to mark it irrelevant.</div>}</article>)}</section>
    </div>
  </>
}
