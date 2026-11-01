export default function Avatar({ compact = false }) {
  return <span className={`avatar ${compact ? 'avatar--compact' : ''}`} aria-hidden="true"><span className="avatar__face"><i /><i /></span></span>
}
