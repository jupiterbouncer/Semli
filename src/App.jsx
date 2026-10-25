import Avatar from './components/Avatar'
import Icon from './components/Icon'
import Sidebar from './components/Sidebar'
import WeeklyRhythm from './components/WeeklyRhythm'
import IndicatorAccordion from './components/IndicatorAccordion'
import Recommendations from './components/Recommendations'
import { indicators, recommendations } from './data/dashboardData'

export default function App() {
  return <div className="app-shell" id="top">
    <Sidebar />
    <main className="dashboard">
      <header className="topbar">
        <div><p className="eyebrow">Personal dashboard <span className="sample-pill">Sample data</span></p><h1>Hey, there.<br />Here’s your week at a glance.</h1></div>
        <div className="topbar__actions"><button className="quiet-button" type="button">This week <span aria-hidden="true">⌄</span></button><button className="icon-button" type="button" aria-label="Notifications"><Icon name="bell" /></button><button className="profile-button" type="button" aria-label="Open profile"><Avatar compact /></button></div>
      </header>
      <div className="privacy-notice"><span aria-hidden="true">✦</span><p>This dashboard uses realistic mock data only. Semli’s indicators describe academic context, not your wellbeing.</p></div>
      <WeeklyRhythm />
      <IndicatorAccordion indicators={indicators} />
      <Recommendations recommendations={recommendations} />
      <footer className="dashboard-footer">Semli is a personal academic companion. You stay in control of what you connect and share.</footer>
    </main>
  </div>
}
