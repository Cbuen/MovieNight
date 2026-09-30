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
