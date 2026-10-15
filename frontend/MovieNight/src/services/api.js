const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-night-lake-three.vercel.app'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(path, method = 'GET', body = null) {
  const options = {
    method,
    credentials: 'include',
    headers: {},
  }

  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const url = `${API_BASE}${path.startsWith('/api') ? path : (path.startsWith('/') ? path : `/${path}`)}`

  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new ApiError('Network error — check that the backend is running.', 0)
  }

  let data
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    data = text ? { message: text } : {}
  }

  if (typeof data === 'string') {
    data = { message: data }
  }

  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      data.messgae ||
      (typeof data === 'object' && data !== null ? JSON.stringify(data) : String(data)) ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return data
}

export { ApiError }

export const api = {
  createParticipant: (displayName) =>
    request('/api/participants/', 'POST', { displayName }),

  createRoom: (roomCode, roomName, submissionLimit) =>
    request('/api/rooms/create', 'POST', { roomCode, roomName, submissionLimit }),

  joinRoom: (roomCode) =>
    request('/api/rooms/join', 'POST', { roomCode: String(roomCode) }),

  submitMovie: (tmdbUrl) =>
    request('/api/rooms/movie/submission', 'POST', { tmdbUrl }),

  startVoting: () =>
    request('/api/rooms/start/voting', 'POST'),

  stopVoting: () =>
    request('/api/rooms/voting/stop', 'POST'),

  submitVote: (movieId) =>
    request('/api/rooms/submit/vote', 'POST', { movie_id: movieId }),

  getVoteResults: () =>
    request('/api/rooms/voting/results', 'POST'),

  getRoom: () =>
    request('/api/room', 'GET'),

  getSession: () =>
    request('/api/session', 'GET'),
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export function getPosterUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path}`
}

export function getRating(voteAverage) {
  if (voteAverage === null || voteAverage === undefined) return null
  return `${voteAverage} / 10`
}
