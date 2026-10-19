## Description

MovieNight is a collaborative movie-selection platform built for groups of friends, families, classmates, or coworkers who want to decide what to watch without going through a long group discussion.

A host can create a temporary movie room and share the room code with participants. Each participant can submit movie suggestions using TMDB links, allowing the application to automatically retrieve movie details such as the title, poster, description, rating, and runtime. Once submissions are complete, participants vote on the available movies and the highest-ranked movie is selected.

The application is designed around short-lived group sessions, so users can participate without creating permanent accounts. This makes MovieNight useful for movie nights, social events, classrooms, team activities, and other situations where a group needs a simple and fair way to make a decision.

## Screenshots

<!-- Replace these image URLs with your own GitHub image URLs -->

<div style="display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 10px;">

  <img
    alt="Movie Night welcome screen"
    src="https://github.com/user-attachments/assets/379a9284-0aa4-4070-abfe-1db4f5dbc7c7"
    style="width: 100%; border-radius: 8px;"
  />

  <img
    alt="MovieNight create and or join rom"
    src="https://github.com/user-attachments/assets/e832065b-0dfc-4253-b1d1-335abd618ddf"
    style="width: 100%; border-radius: 8px;"
  />


  <img
    alt="MovieNight movie submission screen"
    src="YOUR_SCREENSHOT_URL"
    style="width: 100%; border-radius: 8px;"
  />

  <img
    alt="MovieNight voting screen"
    src="YOUR_SCREENSHOT_URL"
    style="width: 100%; border-radius: 8px;"
  />

</div>

## Technologies Used

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Fetch API

### Backend

- Node.js
- Express.js
- Express Session
- MySQL session store
- Axios

### Database

- MySQL
- Aiven Cloud MySQL
- Foreign key relationships
- Cascading deletes
- Aggregation queries for vote results

### External Services

- TMDB API
- Vercel
- Aiven Cloud

## Database Design

MovieNight uses the following primary tables:

- `sessions` — Stores Express session data
- `participants` — Stores users participating in rooms
- `rooms` — Stores room information and host details
- `movie_submissions` — Stores movies submitted to rooms
- `votes` — Stores participant votes

The database uses foreign key relationships to maintain data integrity. When a room or participant is deleted, related records can be removed automatically through cascading deletes.

## API Routes

### Participants

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/participants/` | Create a participant session |
| `GET` | `/api/session` | Retrieve the current session |
| `POST` | `/api/participants/delete` | Delete a participant |
| `POST` | `/api/participants/abandon` | Abandon the current session |

### Rooms

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/rooms/create` | Create a room |
| `POST` | `/api/rooms/join` | Join a room using a room code |
| `GET` | `/api/room` | Retrieve the current room |
| `POST` | `/api/rooms/delete` | Delete a room |

### Movie Submissions

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/rooms/movie/submission` | Submit a movie using a TMDB URL |

### Voting

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/rooms/start/voting` | Start voting |
| `POST` | `/api/rooms/submit/vote` | Submit a vote |
| `POST` | `/api/rooms/voting/stop` | Stop voting |
| `POST` | `/api/rooms/voting/results` | Retrieve voting results |

## Local Development

### Clone the Repository

```bash
git clone https://github.com/Cbuen/MovieNight.git
cd MovieNight
