import { useState, useEffect } from 'react'
import { api } from './services/api'
import ParticipantSetup from './components/ParticipantSetup'
import CreateRoom from './components/CreateRoom'
import JoinRoom from './components/JoinRoom'
import RoomDashboard from './components/RoomDashboard'
import './App.css'

function App() {
  const [participant, setParticipant] = useState(null)
  const [room, setRoom] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingStarted, setVotingStarted] = useState(false)
  const [winner, setWinner] = useState(null)
  const [view, setView] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const clearMessages = () => {
    setError('')
    setMessage('')
  }

  const fetchRoom = async () => {
    try {
      const data = await api.getRoom()
      if (data.success) {
        setRoom({
          id: data.room.id,
          roomCode: data.room.room_code,
          roomName: data.room.room_name,
          submissionLimit: data.room.submission_limit,
          votingStatus: data.room.voting_status,
        })
        setParticipant({
          id: data.participant.id,
          displayName: data.participant.display_name,
        })
        setSubmissions(data.submissions || [])
        setIsHost(data.isHost)
        setHasVoted(data.hasVoted)

        if (data.room.voting_status === 1) {
          setVotingStarted(true)
        } else if (data.totalVotes > 0) {
          setVotingStarted(true)
          setWinner(data.winner || null)
        } else {
          setVotingStarted(false)
          setWinner(null)
        }
      }
    } catch (err) {
      if (err.status === 401) {
        setView('roomChoice')
        setRoom(null)
        setSubmissions([])
      } else {
        setError(err.message)
      }
    }
  }

  const checkSession = async () => {
    try {
      const data = await api.getSession()
      if (data.success && data.participantId) {
        setParticipant({
          id: data.participantId,
          displayName: data.displayName,
        })
        if (data.roomId) {
          setView('dashboard')
          await fetchRoom()
        } else {
          setView('roomChoice')
        }
      }
    } catch {
      setView('setup')
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await checkSession()
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateParticipant = async (displayName) => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.createParticipant(displayName)
      if (data.success) {
        setParticipant({ id: data.participantId, displayName })
        setMessage(data.message)
        setView('roomChoice')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (roomCode, roomName, submissionLimit) => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.createRoom(roomCode, roomName, submissionLimit)
      if (data.success) {
        setMessage(data.message)
        setView('dashboard')
        setVotingStarted(false)
        setWinner(null)
        setRoom({
          roomCode,
          roomName,
          submissionLimit,
          votingStatus: 0,
        })
        await fetchRoom()
      }
    } catch (err) {
      if (err.status === 409) {
        setView('dashboard')
        await fetchRoom()
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (roomCode) => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.joinRoom(roomCode)
      if (data.success) {
        setMessage(data.message)
        setView('dashboard')
        setVotingStarted(false)
        setWinner(null)
        setRoom({
          roomCode: data.room.roomCode,
          roomName: data.room.roomName,
          submissionLimit: data.room.submissionLimit,
          votingStatus: 0,
        })
        await fetchRoom()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMovie = async (tmdbUrl) => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.submitMovie(tmdbUrl)
      if (data.success) {
        await fetchRoom()
        return data
      }
      return null
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleStartVoting = async () => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.startVoting()
      if (data.success) {
        setMessage(data.message)
        setVotingStarted(true)
        await fetchRoom()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStopVoting = async () => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.stopVoting()
      if (data.success) {
        setMessage(data.message)
        await fetchRoom()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (movieId) => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.submitVote(movieId)
      if (data.success) {
        setHasVoted(true)
        setMessage(data.message)
        await fetchRoom()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAbandonSession = async () => {
    setLoading(true)
    clearMessages()
    try {
      const data = await api.abandonSession()
      if (data.success) {
        setParticipant(null)
        setRoom(null)
        setSubmissions([])
        setIsHost(false)
        setHasVoted(false)
        setVotingStarted(false)
        setWinner(null)
        setMessage('')
        setView('setup')
      } else if (data.message) {
        setError(data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MovieNight</h1>
      </header>

      <main className="app-main">
        {view === 'setup' && (
          <ParticipantSetup
            onSubmit={handleCreateParticipant}
            loading={loading}
            error={error}
          />
        )}

        {view === 'roomChoice' && (
          <div className="room-choice">
            <h2>Create or Join a Room</h2>
            <div className="room-choice-grid">
              <CreateRoom
                onSubmit={handleCreateRoom}
                loading={loading}
                error={error}
              />
              <JoinRoom
                onSubmit={handleJoinRoom}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        )}

        {view === 'dashboard' && !room && (
          <div className="card">
            <p className="info-text">Loading room data...</p>
          </div>
        )}

        {view === 'dashboard' && room && (
          <RoomDashboard
            room={room}
            participant={participant}
            submissions={submissions}
            isHost={isHost}
            hasVoted={hasVoted}
            votingStarted={votingStarted}
            winner={winner}
            loading={loading}
            error={error}
            message={message}
            onRefresh={fetchRoom}
            onSubmitMovie={handleSubmitMovie}
            onStartVoting={handleStartVoting}
            onStopVoting={handleStopVoting}
            onVote={handleVote}
            onAbandon={handleAbandonSession}
          />
        )}
      </main>
    </div>
  )
}

export default App
