import cors from 'cors';
import express from 'express'
import { apiTest } from './controllers/test.controller.js';
import { createParticipant, deleteParticipant } from './controllers/participants.controller.js';
import { createRoom, deleteRoom } from './controllers/rooms.controller.js';

const app = express();


// cross origin resource sharing configuration for vite react communcation with express
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173/'
}));

const port = 3000;


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


// create a participant, pre joinning/creating movie room
app.post('/api/participants/', createParticipant);

// delete participants
app.post('/api/participants/delete', deleteParticipant);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
