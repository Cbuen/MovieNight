import { useState } from 'react'

export default function CreateRoom({ onSubmit, loading, error }) {
  const [roomName, setRoomName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [submissionLimit, setSubmissionLimit] = useState(3)

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setRoomCode(code)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roomName.trim() || !roomCode.trim() || loading) return
    const limit = parseInt(submissionLimit, 10)
    if (isNaN(limit) || limit < 1) return
    onSubmit(roomCode.trim(), roomName.trim(), limit)
  }

  return (
    <div className="card">
      <h2>Create a Room</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Room name"
          disabled={loading}
        />
        <div className="field-group">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            disabled={loading}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={generateCode}
            disabled={loading}
          >
            Generate
          </button>
        </div>
        <input
          type="number"
          value={submissionLimit}
          onChange={(e) => setSubmissionLimit(e.target.value)}
          min="1"
          max="20"
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !roomName.trim() || !roomCode.trim()}>
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
