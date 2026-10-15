import { useState } from 'react'

export default function JoinRoom({ onSubmit, loading, error }) {
  const [roomCode, setRoomCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roomCode.trim() || loading) return
    onSubmit(roomCode.trim())
  }

  return (
    <div className="card">
      <h2>Join a Room</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Room code"
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !roomCode.trim()}>
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
