import Icon from './Icon'

export default function SettingsRow({ icon, tone, title, detail, open, onClick, children }) {
  const detailsId = `settings-${title.toLowerCase().replaceAll(' ', '-')}`
  return <article className={`settings-row settings-row--${tone} ${open ? 'settings-row--open' : ''}`}>
    <button type="button" className="settings-row__trigger" aria-expanded={open} aria-controls={detailsId} onClick={onClick}>
      <span className="settings-row__icon"><Icon name={icon} /></span><span className="settings-row__copy"><strong>{title}</strong><span>{detail}</span></span><Icon name="chevron" className="settings-row__chevron" />
    </button>
    {open && <div className="settings-row__details" id={detailsId}>{children}</div>}
  </article>
}
