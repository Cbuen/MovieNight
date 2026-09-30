// API functionailtiy with movie submissions

import { pool } from "../config/db.js";
import axios from "axios";

import "dotenv/config";

const API_BASE = 'https://api.themoviedb.org'

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
// TODO: First make it work, Second account for duplicates no double submissions, sql asks for unique tmdb id
// TODO: Ensure user can only submit to the room they are joined in
export const createMovieSubmission = async (req, res) => {

  // To check that participant is within submission limits of room
  const [submissions] = await pool.execute(
    `SELECT COUNT(*) AS count FROM movie_submissions WHERE participant_id = ${req.session.participantId}`
  )

  const [roomSubmissionLimit] = await pool.execute(
    `SELECT submission_limit FROM rooms WHERE id = ${req.session.roomId}`
  );

  if (submissions[0].count >= roomSubmissionLimit[0].submission_limit) {
    return res.status(404).json({
      success: false,
      error: "Submission Limit Exceeded"
    })
  }

  const tmdbUrl = req.body.tmdbUrl; // raw url to be extacted using regex
  const tmdbId = tmdbUrl.match(/(?<=\/)\d+(?=-)/)?.[0];
  const API_URL = `${API_BASE}/3/movie/${tmdbId}?language=en-US`;

  const options = {
    method: 'GET',
    url: API_URL,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.API_KEY}`
    }
  };

  try {
    const response = await axios(options);
    const result = await pool.execute(
      `INSERT INTO movie_submissions (room_id, participant_id, tmdb_movie_id, title, poster_url, description, runtime) VALUES (?,?,?,?,?,?,?)`, [req.session.roomId, req.session.participantId, response.data.id, response.data.original_title, response.data.poster_path, response.data.overview, response.data.runtime]
    )
    // console.log(response.data);
    // console.log(result);
    return res.status(200).json({
      success: true,
      result: result[0],
      response: response.data
    })
  }
  catch (error) {
    // console.log(error)
    return res.status(400).json({
      success: false,
      error: error
    })
  }
};


// TODO: Add controller function for removeing row if needed
