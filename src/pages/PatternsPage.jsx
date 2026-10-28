import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import CategoryTabs from '../components/CategoryTabs'
import SubmissionChart from '../components/SubmissionChart'

const tabs = [{ id: 'academic', label: 'Academic' }, { id: 'wellbeing', label: 'Wellbeing' }, { id: 'summary', label: 'Summary' }]

export default function PatternsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('academic')
  return <><PageHeader title="My patterns" description="Review recorded academic context and what it may be useful for." />
    <CategoryTabs categories={tabs} active={activeTab} onChange={setActiveTab} label="Pattern category" />
    <div id={`${activeTab}-panel`} role="tabpanel" aria-labelledby={`${activeTab}-tab`}>
      {activeTab === 'academic' && <div className="page-stack"><SubmissionChart /><section className="context-card"><span className="context-card__mark">✦</span><div><p className="eyebrow">What this may be useful for</p><h2>Plan around a change in timing</h2><p>In this sample, three recorded submissions happened later than the sample baseline. That can reflect a busier week or competing priorities; it does not describe your wellbeing.</p><button type="button" className="text-link" onClick={() => onNavigate('discover')}>Explore planning suggestions <span aria-hidden="true">→</span></button></div></section></div>}
      {activeTab === 'wellbeing' && <section className="empty-state"><span aria-hidden="true">○</span><h2>Optional check-ins would appear here</h2><p>This prototype does not collect wellbeing information. In a future version, any personal check-in would be voluntary, separate from academic activity, and under your control.</p></section>}
      {activeTab === 'summary' && <section className="empty-state"><span aria-hidden="true">✦</span><h2>A clear summary, not a score</h2><p>Semli will keep workload, submission timing, and optional activity context separate. It will not turn them into a burnout score or clinical assessment.</p></section>}
    </div>
  </>
}
