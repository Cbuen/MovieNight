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


// cross origin resource sharing configuration for vite react communcation with express
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const port = 3000;

// initalize the session for mysql2 pool
const MySQLStore = MySqlStoreFactory(session);
const sessionStore = new MySQLStore({}, pool);

// config middleware with app
app.use(session({
  key: 'room_session',
  secret: 'asbucpdeer123!',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    httpOnly: true,             // Keeps cookie secure from frontend JS hacking
    secure: false               // Set to true later if using HTTPS in production
  }
}));

// hello world route
app.get('/', (req, res) => {
  res.json("test");
  res.status(200);
});

// api test route for react
app.get('/api/test', apiTest);

// TODO: Fix route names for consistency

// rooms api
app.post('/api/rooms', (req, res) => {
  res.json("sucess")
});

app.post('/api/rooms/create', createRoom);

app.post('/api/rooms/delete', deleteRoom);

app.post('/api/rooms/join', joinRoom);

// get room info, submissions, and participant info
app.get('/api/room', getRoom);


// create a participant, pre joinning/creating movie room
app.post('/api/participants/', createParticipant);

// get session info for frontend state
app.get('/api/session', getSession);

// delete participants
app.post('/api/participants/delete', deleteParticipant);

// movie Submission routes
app.post('/api/rooms/movie/submission', createMovieSubmission);

// start voting session
app.post('/api/rooms/start/voting', startVoting);

// submit vote
app.post('/api/rooms/submit/vote', submitVote);

// get voting results
app.post('/api/rooms/voting/results', voteResults);

app.post('/api/rooms/voting/stop', stopVoting);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
