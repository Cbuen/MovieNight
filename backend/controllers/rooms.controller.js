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
  //TODO: participant should only be able to create one room. fix this in the express route?
  const roomCode = req.body.roomCode;
  const roomName = req.body.roomName;
  const participantId = req.body.participantId;
  const submissionLimit = req.body.submissionLimit; // overall limit NOT PER PERSON
  try {
    const [participants] = await pool.execute(
      `SELECT * FROM participants WHERE is_host = 1 AND id = ${participantId}`
    );

    if (participants.length === 1) {
      return res.status(409).json({
        success: false,
        message: "Room already exists"
      })
    }

    const [result] = await pool.execute(
      `INSERT INTO rooms (room_code, room_name, host_participant_id, submission_limit) VALUES (?, ?, ?, ?)`,
      [roomCode, roomName, participantId, submissionLimit]
    )

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


