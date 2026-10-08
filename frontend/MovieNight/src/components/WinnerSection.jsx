import { getPosterUrl, getRating } from '../services/api'

export default function WinnerSection({ winner }) {
  if (!winner) {
    return null
  }

  const title = winner.title || winner.original_title || 'Untitled'
  const poster = winner.poster_url || winner.poster_path

  return (
    <div className="card winner-section">
      <h2>Winning Movie</h2>
      <div className="winner-grid">
        {poster ? (
          <img src={getPosterUrl(poster)} alt={title} className="winner-poster" />
        ) : (
          <div className="winner-poster-placeholder">No Poster</div>
        )}
        <div className="winner-info">
          <h3>{title}</h3>
          {winner.rating != null && (
            <p>Rating: {getRating(winner.rating) ?? winner.rating}</p>
          )}
          {winner.vote_average != null && winner.rating == null && (
            <p>Rating: {getRating(winner.vote_average)}</p>
          )}
          {winner.runtime && <p>Runtime: {winner.runtime} min</p>}
          {winner.description && <p>{winner.description}</p>}
          <p className="vote-count">
            {winner.vote_count} total {winner.vote_count === 1 ? 'vote' : 'votes'}
          </p>
        </div>
      </div>
    </div>
  )
}
