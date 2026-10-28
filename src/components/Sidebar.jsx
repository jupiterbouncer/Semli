import Icon from './Icon'

const items = [
  ['home', 'Home'], ['chart', 'My patterns'], ['compass', 'Discover'], ['user', 'My Semli'], ['settings', 'Settings'],
]

const routes = { Home: 'home', 'My patterns': 'patterns', Discover: 'discover', Settings: 'settings' }

export default function Sidebar({ currentPage, onNavigate }) {
  return <aside className="sidebar">
    <a className="brand" href="#home" onClick={() => onNavigate('home')} aria-label="Semli home"><span className="brand__mark" />Semli</a>
    <nav aria-label="Primary navigation">
      <ul className="nav-list">
        {items.map(([icon, label]) => {
          const route = routes[label]
          if (!route) return <li key={label}><span className="nav-link nav-link--disabled" title="Available in a future milestone"><Icon name={icon} size={19} />{label}<span className="nav-soon">Soon</span></span></li>
          const active = currentPage === route
          return <li key={label}><a href={`#${route}`} onClick={() => onNavigate(route)} className={active ? 'nav-link nav-link--active' : 'nav-link'} aria-current={active ? 'page' : undefined}><Icon name={icon} size={19} />{label}</a></li>
        })}
      </ul>
    </nav>
    <p className="sidebar__note">Small insights.<br />Big days.</p>
    <span className="sidebar__leaf" aria-hidden="true" />
  </aside>
}
