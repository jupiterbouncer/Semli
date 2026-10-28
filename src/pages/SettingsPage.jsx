import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import SettingsRow from '../components/SettingsRow'

export default function SettingsPage() {
  const [open, setOpen] = useState(null)
  const toggle = (id) => setOpen(open === id ? null : id)
  return <><PageHeader title="Settings" description="Manage future connections, data choices, and account controls." />
    <div className="settings-groups"><section className="settings-group" aria-labelledby="connection-settings"><h2 id="connection-settings" className="group-label">Connection</h2><SettingsRow icon="link" tone="amber" title="Canvas connection" detail="Not connected in this prototype" open={open === 'canvas'} onClick={() => toggle('canvas')}><p>Canvas is not connected and no academic data is being requested. A later milestone will use student-authorized OAuth; Semli will never ask for a Canvas password or personal access token.</p></SettingsRow></section>
      <section className="settings-group" aria-labelledby="privacy-settings"><h2 id="privacy-settings" className="group-label">Data & privacy</h2><SettingsRow icon="database" tone="moss" title="Data management" detail="No account data is stored in this prototype" open={open === 'data'} onClick={() => toggle('data')}><p>Future controls will explain which fields are used, allow you to disconnect Canvas, and support data export or deletion. They are not active in this frontend milestone.</p></SettingsRow><SettingsRow icon="trash" tone="plum" title="Delete account" detail="Unavailable while this is a mock-data prototype" open={open === 'delete'} onClick={() => toggle('delete')}><p>There is no account to delete here. A production deletion flow must be deliberate, confirm the scope of removal, and cover server-side data and connected services.</p></SettingsRow></section></div>
  </>
}
