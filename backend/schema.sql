-- MovieNight database schema
-- Run this once to set up the database tables

CREATE DATABASE IF NOT EXISTS movieNight;
USE movieNight;

-- Required by express-mysql-session for session storage
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

-- Participants: each person who starts a session
CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(255) NOT NULL,
  room_id INT DEFAULT NULL,
  is_host TINYINT(1) DEFAULT 0
);

-- Rooms: created by a host participant
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(255) NOT NULL UNIQUE,
  room_name VARCHAR(255) NOT NULL,
  host_participant_id INT NOT NULL,
  submission_limit INT DEFAULT 3,
  voting_status TINYINT(1) DEFAULT 0,
  room_status TINYINT(1) DEFAULT 1,
  FOREIGN KEY (host_participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Movie submissions: TMDB movies submitted by participants
CREATE TABLE IF NOT EXISTS movie_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  participant_id INT NOT NULL,
  tmdb_movie_id INT NOT NULL,
  title VARCHAR(255),
  poster_url VARCHAR(500) DEFAULT NULL,
  description TEXT,
  runtime INT DEFAULT NULL,
  rating DECIMAL(3,1) DEFAULT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_per_room (room_id, tmdb_movie_id)
);

-- Votes: one vote per participant per room
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  participant_id INT NOT NULL,
  movie_submission_id INT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_submission_id) REFERENCES movie_submissions(id) ON DELETE CASCADE
);
