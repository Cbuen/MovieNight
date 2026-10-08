const API_BASE = '/api'

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

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
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
    request('/participants/', 'POST', { displayName }),

  createRoom: (roomCode, roomName, submissionLimit) =>
    request('/rooms/create', 'POST', { roomCode, roomName, submissionLimit }),

  joinRoom: (roomCode) =>
    request('/rooms/join', 'POST', { roomCode: String(roomCode) }),

  submitMovie: (tmdbUrl) =>
    request('/rooms/movie/submission', 'POST', { tmdbUrl }),

  startVoting: () =>
    request('/rooms/start/voting', 'POST'),

  stopVoting: () =>
    request('/rooms/voting/stop', 'POST'),

  submitVote: (movieId) =>
    request('/rooms/submit/vote', 'POST', { movie_id: movieId }),

  getVoteResults: () =>
    request('/rooms/voting/results', 'POST'),

  getRoom: () =>
    request('/room', 'GET'),

  getSession: () =>
    request('/session', 'GET'),
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
