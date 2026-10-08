export default function HostControls({ onStartVoting, onStopVoting, votingActive, votingStarted, loading, error, message }) {
  const votingComplete = votingStarted && !votingActive

  return (
    <div className="card host-controls">
      <h2>Host Controls</h2>

      {!votingStarted && !votingActive && (
        <button className="btn-primary" onClick={onStartVoting} disabled={loading}>
          {loading ? 'Starting...' : 'Start Voting'}
        </button>
      )}

      {votingActive && (
        <button className="btn-primary" onClick={onStopVoting} disabled={loading}>
          {loading ? 'Stopping...' : 'Stop Voting'}
        </button>
      )}

      {votingComplete && <p className="info-text">Voting is complete.</p>}

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
    </div>
  )
}
