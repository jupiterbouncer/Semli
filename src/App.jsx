import { useEffect, useState } from 'react'
import Avatar from './components/Avatar'
import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import WeeklyRhythm from './components/WeeklyRhythm'
import IndicatorAccordion from './components/IndicatorAccordion'
import Recommendations from './components/Recommendations'
import PatternsPage from './pages/PatternsPage'
import DiscoverPage from './pages/DiscoverPage'
import SettingsPage from './pages/SettingsPage'
import { indicators, recommendations } from './data/dashboardData'

function HomePage() {
  return <>
    <header className="topbar">
      <div><p className="eyebrow">Personal dashboard <span className="sample-pill">Sample data</span></p><h1>Hey, there.<br />Here’s your week at a glance.</h1></div>
      <div className="topbar__actions"><button className="quiet-button" type="button">This week <span aria-hidden="true">⌄</span></button><button className="icon-button" type="button" aria-label="Notifications"><Icon name="bell" /></button><button className="profile-button" type="button" aria-label="Open profile"><Avatar compact /></button></div>
    </header>
    <div className="privacy-notice"><span aria-hidden="true">✦</span><p>This dashboard uses realistic mock data only. Semli’s indicators describe academic context, not your wellbeing.</p></div>
    <WeeklyRhythm />
    <IndicatorAccordion indicators={indicators} />
    <Recommendations recommendations={recommendations} />
  </>
}

export default function App() {
  const validPages = ['home', 'patterns', 'discover', 'settings']
  const currentHash = () => validPages.includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'home'
  const [page, setPage] = useState(currentHash)
  const navigate = (nextPage) => { window.location.hash = nextPage; setPage(nextPage) }
  useEffect(() => { const updatePage = () => setPage(currentHash()); window.addEventListener('hashchange', updatePage); return () => window.removeEventListener('hashchange', updatePage) }, [])
  let content = <HomePage />
  if (page === 'patterns') content = <PatternsPage onNavigate={navigate} />
  if (page === 'discover') content = <DiscoverPage />
  if (page === 'settings') content = <SettingsPage />
  return <div className="app-shell" id="top">
    <Sidebar currentPage={page} onNavigate={navigate} />
    <main className="dashboard" id="main-content" tabIndex="-1">
      {content}
      <footer className="dashboard-footer">Semli is a personal academic companion. You stay in control of what you connect and share.</footer>
    </main>
  </div>
}
