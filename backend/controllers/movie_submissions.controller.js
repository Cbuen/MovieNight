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
  try {
    const participantId = req.session.participantId;
    const roomId = req.session.roomId;

    const [submissions] = await pool.execute(
      `
      SELECT COUNT(*) AS count
      FROM movie_submissions
      WHERE participant_id = ?
        AND room_id = ?
      `,
      [participantId, roomId]
    );

    const [roomSubmissionLimit] = await pool.execute(
      `
      SELECT submission_limit
      FROM rooms
      WHERE id = ?
      `,
      [roomId]
    );

    if (roomSubmissionLimit.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Room not found"
      });
    }

    if (
      submissions[0].count >=
      roomSubmissionLimit[0].submission_limit
    ) {
      return res.status(400).json({
        success: false,
        error: "Submission limit exceeded"
      });
    }

    const tmdbUrl = req.body.tmdbUrl;

    if (!tmdbUrl || typeof tmdbUrl !== "string") {
      return res.status(400).json({
        success: false,
        error: "A valid TMDB URL is required"
      });
    }

    const parsedUrl = new URL(tmdbUrl);
    const match = parsedUrl.pathname.match(/^\/movie\/(\d+)/);
    const tmdbId = match?.[1];

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        error: "Invalid TMDB movie URL"
      });
    }

    const API_URL = `${API_BASE}/3/movie/${tmdbId}?language=en-US`;

    const response = await axios.get(API_URL, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`
      }
    });

    const [result] = await pool.execute(
      `
      INSERT INTO movie_submissions
      (
        room_id,
        participant_id,
        tmdb_movie_id,
        title,
        poster_url,
        description,
        runtime
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        roomId,
        participantId,
        response.data.id,
        response.data.original_title,
        response.data.poster_path,
        response.data.overview,
        response.data.runtime
      ]
    );

    return res.status(201).json({
      success: true,
      result,
      movie: response.data
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};
// TODO: Add controller function for removeing row if needed
