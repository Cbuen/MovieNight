// API functions for rooms DB table interaction
import { pool } from '../config/db.js';

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const apiTest = async (req, res) => {
  res.json("test success");
};



// Creates a new room row in table roomCode must be unique handled on the sql end
/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const createRoom = async (req, res) => {
  const roomCode = req.body.roomCode;
  const roomName = req.body.roomName;
  const participantId = req.session.participantId;
  const submissionLimit = req.body.submissionLimit;

  if (!participantId) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  try {
    // Checks to see if our participant is already a host and throws 409 status
    const [participants] = await pool.execute(
      'SELECT * FROM participants WHERE is_host = 1 AND id = ?',
      [participantId]
    );

    if (participants.length === 1) {
      return res.status(409).json({
        success: false,
        message: "Room already exists"
      })
    }

    // creates room inlcuding FKs for host id
    const [result] = await pool.execute(
      'INSERT INTO rooms (room_code, room_name, host_participant_id, submission_limit) VALUES (?, ?, ?, ?)',
      [roomCode, roomName, participantId, submissionLimit]
    )

    // updates the host participant table row to show host status and update its room ID
    await pool.execute(
      'UPDATE participants SET room_id = ?, is_host = 1 WHERE id = ?',
      [result.insertId, participantId]
    );

    req.session.isHost = true;
    req.session.roomId = result.insertId;
    res.status(200);
    return res.json({
      success: true,
      message: `Room ${roomName} (${roomCode}) created`,
      room: {
        id: result.insertId,
        roomCode,
        roomName,
        submissionLimit
      }
    });
  }
  catch (error) {
    res.status(400);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const deleteRoom = async (req, res) => {
  const roomId = req.body.id;

  try {

    const [result] = await pool.execute(
      'DELETE FROM rooms WHERE id = ?',
      [roomId]
    );

    // check to see if the room requested to delete exists in table before attempt
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Room does not exist"
      })
    }



    res.status(200);
    return res.json({
      success: true,
      message: result
    });
  }
  catch (error) {
    res.status(400);
    return res.json({
      success: false
    });
  }
};


// Uses sessions to get particpant id, allows user to join room via room code
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const joinRoom = async (req, res) => {
  try {
    const roomCode = req.body.roomCode;
    const [room] = await pool.execute(
      'SELECT * FROM rooms WHERE room_code = ?', [roomCode]
    );

    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    const [result] = await pool.execute(
      'UPDATE participants SET room_id = ? WHERE id = ?',
      [room[0].id, req.session.participantId]
    );

    // if 0 affected rows we can assume we attempted to update a non exsitent room and or incorrect participantId
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Participant not found"
      });
    } else {
      req.session.roomId = room[0].id;
      req.session.isHost = false;
      return res.status(200).json({
        success: true,
        message: `You have now joined Room: ${room[0].room_name}`,
        room: {
          id: room[0].id,
          roomCode: room[0].room_code,
          roomName: room[0].room_name,
          submissionLimit: room[0].submission_limit
        }
      });
    }
  } // catches any sql error non existent row
  catch (error) {
    return res.status(400).json({
      success: false,
      error: "Room code or participant ID is incorrect"
    });
  }
}

// TODO: Create closeRoom controller function (can be used to train and build data)
// TODO: Create deleteRoom controller function (can be used to clean schema tables)

// Gets room info, submissions, and participant info for the frontend dashboard
export const getRoom = async (req, res) => {
  try {
    const roomId = req.session.roomId;
    const participantId = req.session.participantId;

    if (!participantId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    if (!roomId) {
      return res.status(401).json({
        success: false,
        message: "Not in a room"
      });
    }

    const [rooms] = await pool.execute(
      'SELECT * FROM rooms WHERE id = ?', [roomId]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    const [participants] = await pool.execute(
      'SELECT * FROM participants WHERE id = ?', [participantId]
    );

    const [submissions] = await pool.execute(
      'SELECT * FROM movie_submissions WHERE room_id = ? ORDER BY id DESC',
      [roomId]
    );

    const [votes] = await pool.execute(
      'SELECT * FROM votes WHERE participant_id = ? AND room_id = ?',
      [participantId, roomId]
    );

    const hasVoted = votes.length > 0;

    const [allVoteCount] = await pool.execute(
      'SELECT COUNT(*) AS count FROM votes WHERE room_id = ?',
      [roomId]
    );

    let winner = null;
    if (rooms[0].voting_status === 0 && allVoteCount[0].count > 0) {
      const [winnerResult] = await pool.execute(
        `SELECT
           ms.*,
           COUNT(v.id) AS vote_count
         FROM votes AS v
         JOIN movie_submissions AS ms
         ON v.movie_submission_id = ms.id
         WHERE v.room_id = ?
         GROUP BY ms.id
         ORDER BY vote_count DESC
         LIMIT 1`,
        [roomId]
      );
      if (winnerResult.length > 0) {
        winner = winnerResult[0];
      }
    }

    return res.status(200).json({
      success: true,
      room: rooms[0],
      participant: participants[0],
      submissions: submissions,
      isHost: req.session.isHost === true,
      hasVoted: hasVoted,
      totalVotes: allVoteCount[0].count,
      winner: winner
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get room data"
    });
  }
};
