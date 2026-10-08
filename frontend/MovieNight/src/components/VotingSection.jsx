import MovieCard from './MovieCard'

export default function VotingSection({
  submissions,
  votingActive,
  hasVoted,
  onVote,
  loading,
  error
}) {
  if (!votingActive) {
    return (
      <div className="card">
        <h2>Voting</h2>
        <p className="info-text">Voting has not started. Waiting for the host to begin.</p>
      </div>
    )
  }

  if (!submissions.length) {
    return (
      <div className="card">
        <h2>Voting</h2>
        <p className="info-text">No movies have been submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Voting</h2>

      {hasVoted && (
        <p className="info-text">Your vote has been committed. Thank you!</p>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="voting-grid">
        {submissions.map((movie) => (
          <div key={movie.id} className="vote-item">
            <MovieCard movie={movie} />
            <button
              className="btn-secondary"
              onClick={() => onVote(movie.id)}
              disabled={!votingActive || hasVoted || loading}
            >
              {hasVoted ? 'Voted' : loading ? 'Voting...' : 'Vote'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
