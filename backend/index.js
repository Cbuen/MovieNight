import "dotenv/config";
import cors from 'cors';
import express from 'express'
import session from 'express-session';
import { pool } from './config/db.js';
import { apiTest } from './controllers/test.controller.js';
import { createParticipant, deleteParticipant, getSession } from './controllers/participants.controller.js';
import { createRoom, deleteRoom, joinRoom, getRoom } from './controllers/rooms.controller.js';
import MySqlStoreFactory from 'express-mysql-session';
import { createMovieSubmission } from './controllers/movie_submissions.controller.js';
import { startVoting, stopVoting, submitVote, voteResults } from './controllers/votes.controller.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin: "https://movienight-frontend.vercel.app",
  credentials: true
}));

const port = process.env.PORT || 3000;

const MySQLStore = MySqlStoreFactory(session);
const sessionStore = new MySQLStore({}, pool);

app.use(session({
  key: 'room_session',
  secret: process.env.SESSION_SECRET || 'asbucpdeer123!',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.get('/', (req, res) => {
  res.json("test");
});

app.get('/api/test', apiTest);

app.post('/api/rooms', (req, res) => {
  res.json("sucess")
});

app.post('/api/rooms/create', createRoom);
app.post('/api/rooms/delete', deleteRoom);
app.post('/api/rooms/join', joinRoom);
app.get('/api/room', getRoom);
app.post('/api/participants/', createParticipant);
app.get('/api/session', getSession);
app.post('/api/participants/delete', deleteParticipant);
app.post('/api/rooms/movie/submission', createMovieSubmission);
app.post('/api/rooms/start/voting', startVoting);
app.post('/api/rooms/submit/vote', submitVote);
app.post('/api/rooms/voting/results', voteResults);
app.post('/api/rooms/voting/stop', stopVoting);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
