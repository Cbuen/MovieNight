import { pool } from "../config/db.js";


/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const startVoting = async (req, res) => {
  if (req.session.isHost === true) {

    const result = await pool.execute(
      `UPDATE rooms SET voting_status = 1 WHERE host_participant_id = ${req.session.participantId}`
    )
    return res.status(200).json({
      success: true,
      message: result[0]
    })
  }

  else {
    return res.status(400).json({
      success: false
    })
  }
}

// TODO: Create submitVote controller function (used to submit a movie vote)
// // each user is allowed one vote
// // later implement host set vote rules such as 3 votes each for top 3, top 5, etc
// // we will handle a pre request voting in the frontend via react state hooks button "commit vote"
// // route used only when user is commiting vote meaning no changes
/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const submitVote = async (req, res) => {

  // TODO: Implement a check if voting session has started
  const [room] = pool.execute(
    `SELECT room_status FROM rooms WHERE id = ${req.session.roomId}`
  );

  if (room.room_status === 0) {
    return res.status(400).json({
      success: false,
      message: "session not started"
    })
  }

  // enforces one vote per participant
  const [votes] = await pool.execute(
    `SELECT COUNT(*) AS count FROM votes WHERE participant_id = ${req.session.participantId}`
  )

  if (votes[0].count > 0) {
    return res.status(400).json({
      success: false,
      message: "participant already vote"
    })
  }

  // insert row into database 
  const movie_id = req.body.movie_id;
  try {
    const [result] = await pool.execute(
      `INSERT INTO votes (room_id, participant_id, movie_submission_id) VALUES (?, ?, ?)`, [req.session.roomId, req.session.participantId, movie_id]
    );

    return res.status(200).json({
      success: true,
      message: result[0]
    })
  }
  catch (error) {
    return res.status(400).json({
      success: false,
      message: error
    })
  }

}

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const voteResults = async (req, res) => {
  // TODO: create a querey to return id of the top movie to query movie_submission table or use a join research!
  // // MAKE SURE ITS ALSO FOR THE CORRECT ROOM NOT BASED ON ALL THE VOTES IF POSSIBLE
  try {
    const [result] = pool.execute(
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
    )

    return res.status(200).json({
      success: true,
      result: result[0]
    })

  }
  catch (error) {
    return res.status(400).json({
      success: false,
      error: error
    })
  }
}

