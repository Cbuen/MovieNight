import { pool } from "../config/db.js";

// TODO: Works but throws error
/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const startVoting = async (req, res) => {
  if (req.session.isHost === true) {
    try {
      const [result] = await pool.execute(
        'UPDATE rooms SET voting_status = 1 WHERE host_participant_id = ?',
        [req.session.participantId]
      );
      return res.status(200).json({
        success: true,
        message: "Voting has started",
        result: result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  else {
    return res.status(403).json({
      success: false,
      message: "Only the host can start voting"
    });
  }
}

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const stopVoting = async (req, res) => {
  try {
    // Check if voting session already completed
    const [[room]] = await pool.execute(
      `SELECT * FROM rooms WHERE id = ?`, [req.session.roomId]
    );

    if (room.voting_status == 0) {
      return res.status(400).json({
        success: false,
        message: "room is already completed"
      });
    }


    if (req.session.isHost === true) {
      const [result] = await pool.execute(
        `
        UPDATE rooms
        SET voting_status = 0
        WHERE host_participant_id = ?
        `,
        [req.session.participantId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: "Voting could not be stopped",
          result
        });
      }

      return res.status(200).json({
        success: true,
        message: "Voting has stopped",
        result
      });
    }

    return res.status(403).json({
      success: false,
      message: "Only the host can stop voting"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const submitVote = async (req, res) => {
  try {
    const [room] = await pool.execute(
      'SELECT voting_status FROM rooms WHERE id = ?', [req.session.roomId]
    );

    if (!room[0] || room[0].voting_status === 0) {
      return res.status(400).json({
        success: false,
        message: "Voting not active"
      });
    }

    // enforces one vote per participant
    const [votes] = await pool.execute(
      'SELECT COUNT(*) AS count FROM votes WHERE participant_id = ? AND room_id = ?',
      [req.session.participantId, req.session.roomId]
    );

    if (votes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: "Participant has already voted"
      });
    }

    // insert row into database
    const movie_id = req.body.movie_id;
    try {
      const [result] = await pool.execute(
        'INSERT INTO votes (room_id, participant_id, movie_submission_id) VALUES (?, ?, ?)',
        [req.session.roomId, req.session.participantId, movie_id]
      );

      return res.status(200).json({
        success: true,
        message: "Vote submitted",
        result: result
      });
    }
    catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

}

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const voteResults = async (req, res) => {
  try {
    const [result] = await pool.execute(
      `SELECT
         ms.*,
         COUNT(v.id) AS vote_count
       FROM votes AS v
       JOIN movie_submissions AS ms
       ON v.movie_submission_id = ms.id
       WHERE v.room_id = ?
       GROUP BY ms.id
       ORDER BY vote_count DESC
       LIMIT 1`, [req.session.roomId]
    );

    return res.status(200).json({
      success: true,
      result: result[0]
    });
  }
  catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

