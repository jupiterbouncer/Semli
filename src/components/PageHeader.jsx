import Avatar from './Avatar'
import Icon from './Icon'

export default function PageHeader({ title, description, eyebrow = 'Personal dashboard' }) {
  return <header className="page-header">
    <div><p className="eyebrow">{eyebrow} <span className="sample-pill">Sample data</span></p><h1>{title}</h1>{description && <p className="page-header__description">{description}</p>}</div>
    <div className="topbar__actions"><button className="icon-button" type="button" aria-label="Notifications"><Icon name="bell" /></button><button className="profile-button" type="button" aria-label="Open profile"><Avatar compact /></button></div>
  </header>
}
