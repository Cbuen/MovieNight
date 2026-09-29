import cors from 'cors';
import express from 'express'
import session from 'express-session';
import { pool } from './config/db.js';
import { apiTest } from './controllers/test.controller.js';
import { createParticipant, deleteParticipant } from './controllers/participants.controller.js';
import { createRoom, deleteRoom, joinRoom } from './controllers/rooms.controller.js';
import MySqlStoreFactory from 'express-mysql-session';
import { createMovieSubmission } from './controllers/movie_submissions.controller.js';

const app = express();


// cross origin resource sharing configuration for vite react communcation with express
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173/'
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

// rooms api
app.post('/api/rooms', (req, res) => {
  res.json("sucess")
});

app.post('/api/rooms/create', createRoom);

app.post('/api/rooms/delete', deleteRoom);

app.post(`/api/rooms/join`, joinRoom);


// create a participant, pre joinning/creating movie room
app.post('/api/participants/', createParticipant);

// delete participants
app.post('/api/participants/delete', deleteParticipant);

// Movie Submission routes
app.post('/api/rooms/movie/submission', createMovieSubmission);


app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
