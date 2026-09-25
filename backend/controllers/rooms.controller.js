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
  const participantId = req.body.participantId;
  const submissionLimit = req.body.submissionLimit; // overall limit NOT PER PERSON
  try {
    // Checks to see if our participant is already a host and throws 409 status 
    const [participants] = await pool.execute(
      `SELECT * FROM participants WHERE is_host = 1 AND id = ${participantId}`
    );

    if (participants.length === 1) {
      return res.status(409).json({
        success: false,
        message: "Room already exists"
      })
    }

    // creates room inlcuding FKs for host id
    const [result] = await pool.execute(
      `INSERT INTO rooms (room_code, room_name, host_participant_id, submission_limit) VALUES (?, ?, ?, ?)`,
      [roomCode, roomName, participantId, submissionLimit]
    )

    // updates the host participant table row to show host status and update its room ID
    await pool.execute(
      `UPDATE participants SET room_id = ${result.insertId}, is_host = 1 WHERE id = ${participantId}`
    );

    res.status(200);
    return res.json({
      success: true,
      message: `${result}`
    });
  }
  catch (error) {
    res.status(400);
    return res.json({
      success: false,
      message: error
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
      `DELETE FROM rooms WHERE id = ${roomId}`
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
      `SELECT * FROM rooms WHERE room_code = ${roomCode}`
    );

    const [result] = await pool.execute(
      `UPDATE participants SET room_id = ${room[0].id} WHERE id = ${req.session.participantId}`
    );

    // if 0 affected rows we can assume we attempted to update a non exsitent room and or incorrect participantId
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        messgae: "Room Code or Participant ID is incorrect"
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `You have now joined Room: ${room[0].room_name}`
      });
    }
  } // catches any sql error non existent row
  catch (error) {
    return res.status(400).json({
      error: "participant or room does not exist!"
    });
  }
}
