import Icon from './Icon'

const items = [
  ['home', 'Home'], ['chart', 'My patterns'], ['compass', 'Discover'], ['user', 'My Semli'], ['settings', 'Settings'],
]

export default function Sidebar() {
  return <aside className="sidebar">
    <a className="brand" href="#top" aria-label="Semli home"><span className="brand__mark" />Semli</a>
    <nav aria-label="Primary navigation">
      <ul className="nav-list">
        {items.map(([icon, label], index) => <li key={label}><a href={index === 0 ? '#top' : '#'} className={index === 0 ? 'nav-link nav-link--active' : 'nav-link'} aria-current={index === 0 ? 'page' : undefined}><Icon name={icon} size={19} />{label}</a></li>)}
      </ul>
    </nav>
    <p className="sidebar__note">Small insights.<br />Big days.</p>
    <span className="sidebar__leaf" aria-hidden="true" />
  </aside>
}
