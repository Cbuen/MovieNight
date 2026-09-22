import cors from 'cors';
import express from 'express'
import { apiTest } from './controllers/test.controller.js';
import { createParticipant } from './controllers/participants.controller.js';

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
app.get('/api/test', apiTest)

// rooms api
app.post('/api/rooms', (req, res) => {
  res.json("sucess")
});

// create a participant, pre joinning/creating movie room
app.post('/api/participants/', createParticipant)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
