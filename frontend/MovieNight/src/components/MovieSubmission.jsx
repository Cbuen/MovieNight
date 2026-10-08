import { useState } from 'react'
import { getPosterUrl } from '../services/api'

export default function MovieSubmission({
  onSubmit,
  loading,
  error,
  submissionLimit,
  participantSubmissionCount,
  existingTmdbIds,
  onSubmitted
}) {
  const [tmdbUrl, setTmdbUrl] = useState('')
  const [localError, setLocalError] = useState('')
  const [preview, setPreview] = useState(null)

  const canSubmitMore = participantSubmissionCount < submissionLimit
  const remaining = submissionLimit - participantSubmissionCount

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitMore || !tmdbUrl.trim() || loading) return
    setLocalError('')

    const match = tmdbUrl.match(/movie\/(\d+)/)
    const tmdbId = match ? parseInt(match[1], 10) : null
    if (tmdbId && existingTmdbIds.includes(tmdbId)) {
      setLocalError('This movie has already been submitted to this room.')
      return
    }

    const result = await onSubmit(tmdbUrl.trim())
    if (result?.movie) {
      setPreview(result.movie)
      setTmdbUrl('')
      onSubmitted && onSubmitted()
    }
  }

  const clearPreview = () => setPreview(null)

  return (
    <div className="card">
      <h2>Submit a Movie</h2>

      {!canSubmitMore && (
        <p className="info-text">Submission limit ({submissionLimit}) reached.</p>
      )}

      {canSubmitMore && (
        <>
          <p className="info-text">{remaining} submission{remaining !== 1 ? 's' : ''} remaining.</p>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="url"
              value={tmdbUrl}
              onChange={(e) => { setTmdbUrl(e.target.value); setLocalError('') }}
              placeholder="https://www.themoviedb.org/movie/123-movie-title"
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !tmdbUrl.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Movie'}
            </button>
          </form>
        </>
      )}

      {(error || localError) && <p className="error-text">{error || localError}</p>}

      {preview && (
        <div className="submitted-movie">
          <h3>Submitted: {preview.original_title}</h3>
          <div className="movie-preview">
            {preview.poster_path ? (
              <img src={getPosterUrl(preview.poster_path)} alt={preview.original_title} />
            ) : <div className="movie-poster-placeholder">No Poster</div>}
            <div className="movie-preview-info">
              {preview.vote_average != null && (
                <p>Rating: {preview.vote_average} / 10</p>
              )}
              {preview.runtime && <p>Runtime: {preview.runtime} min</p>}
              {preview.overview && <p>{preview.overview}</p>}
            </div>
          </div>
          <button className="btn-secondary" onClick={clearPreview}>
            Clear Preview
          </button>
        </div>
      )}
    </div>
  )
}
