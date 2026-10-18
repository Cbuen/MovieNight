import MovieCard from './MovieCard'
import MovieSubmission from './MovieSubmission'
import HostControls from './HostControls'
import VotingSection from './VotingSection'
import WinnerSection from './WinnerSection'

export default function RoomDashboard({
  room,
  participant,
  submissions,
  isHost,
  hasVoted,
  votingStarted,
  winner,
  loading,
  error,
  message,
  onRefresh,
  onSubmitMovie,
  onStartVoting,
  onStopVoting,
  onVote,
  onAbandon,
}) {
  const votingActive = room?.votingStatus === 1
  const votingComplete = votingStarted && !votingActive

  const participantSubmissions = submissions.filter(
    (s) => s.participant_id === participant?.id
  )
  const participantSubmissionCount = participantSubmissions.length
  const existingTmdbIds = submissions.map((s) => s.tmdb_movie_id)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>{room?.roomName || 'Room'}</h2>
        <div className="room-meta">
          <span className="room-code">Code: {room?.roomCode}</span>
          {isHost && <span className="badge host-badge">Host</span>}
          <span
            className={`status-badge ${votingActive ? 'active' : votingComplete ? 'complete' : 'inactive'}`}
          >
            {votingActive ? 'Voting Active' : votingComplete ? 'Voting Complete' : 'Waiting to Start'}
          </span>
        </div>
        <p className="participant-info">
          Playing as: <strong>{participant?.displayName}</strong>
        </p>
      </header>

      {error && <p className="error-text">{error}</p>}
      {message && !error && <p className="success-text">{message}</p>}

      <section className="submissions-section">
        <h3>Submitted Movies ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <p className="info-text">No movies have been submitted yet.</p>
        ) : (
          <div className="movie-grid">
            {submissions.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {participant && (
        <section className="actions-section">
          <button
            type="button"
            className="abandon-btn"
            onClick={() => {
              const confirmed = window.confirm("Are you sure you want to leave this session?");
              if (confirmed) {
                onAbandon?.();
              }
            }}
            disabled={loading}
          >
            Abandon Session
          </button>
        </section>
      )}

      {!votingActive && !votingComplete && (
        <MovieSubmission
          onSubmit={onSubmitMovie}
          loading={loading}
          error={error}
          submissionLimit={room?.submissionLimit || 3}
          participantSubmissionCount={participantSubmissionCount}
          existingTmdbIds={existingTmdbIds}
          onSubmitted={onRefresh}
        />
      )}

      {votingActive && (
        <VotingSection
          submissions={submissions}
          votingActive={votingActive}
          hasVoted={hasVoted}
          onVote={onVote}
          loading={loading}
          error={error}
        />
      )}

      {votingComplete && winner && <WinnerSection winner={winner} />}

      {isHost && (
        <HostControls
          onStartVoting={onStartVoting}
          onStopVoting={onStopVoting}
          votingActive={votingActive}
          votingStarted={votingStarted}
          loading={loading}
          error={error}
          message={message}
        />
      )}
    </div>
  )
}
