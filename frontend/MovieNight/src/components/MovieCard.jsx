import { getPosterUrl, getRating } from '../services/api'

export default function MovieCard({ movie }) {
  const title = movie.title || movie.original_title || 'Untitled'
  const poster = movie.poster_url || movie.poster_path

  return (
    <div className="movie-card">
      {poster ? (
        <img
          src={getPosterUrl(poster)}
          alt={title}
          className="movie-poster"
        />
      ) : (
        <div className="movie-poster-placeholder">No Poster</div>
      )}
      <div className="movie-info">
        <h3>{title}</h3>
        {movie.rating != null && (
          <p className="movie-rating">Rating: {getRating(movie.rating) ?? movie.rating}</p>
        )}
        {movie.vote_average != null && movie.rating == null && (
          <p className="movie-rating">Rating: {getRating(movie.vote_average)}</p>
        )}
        {movie.runtime && (
          <p className="movie-runtime">Runtime: {movie.runtime} min</p>
        )}
        {movie.description && (
          <p className="movie-description">{movie.description}</p>
        )}
        {movie.vote_count !== undefined && movie.vote_count !== null && (
          <p className="vote-count">{movie.vote_count} vote{movie.vote_count !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
