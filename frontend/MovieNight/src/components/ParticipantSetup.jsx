import { useState } from 'react'

export default function ParticipantSetup({ onSubmit, loading, error }) {
  const [displayName, setDisplayName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!displayName.trim() || loading) return
    onSubmit(displayName.trim())
  }

  return (
    <div className="card">
      <h2>Welcome to MovieNight</h2>
      <p>Enter your display name to get started.</p>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          disabled={loading}
          maxLength={50}
        />
        <button type="submit" className="btn-primary" disabled={loading || !displayName.trim()}>
          {loading ? 'Creating...' : 'Create Participant'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
