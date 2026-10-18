// API functions for participants DB table interaction

import { pool } from '../config/db.js';

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const createParticipant = async (req, res) => {
  const displayName = req.body.displayName;
  const name = displayName?.trim();

  if (
    typeof displayName !== "string" ||
    name.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Display name is required"
    });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO participants (display_name) VALUES (?)',
      [name]
    );

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session error"
        });
      }
      req.session.participantId = result.insertId;
      req.session.isHost = false;
      req.session.displayName = name;
      res.status(201).json({
        success: true,
        message: `${name} has been created!`,
        participantId: result.insertId
      });
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export const getSession = async (req, res) => {
  if (!req.session.participantId) {
    return res.status(401).json({
      success: false,
      message: "No active session"
    });
  }

  return res.status(200).json({
    success: true,
    participantId: req.session.participantId,
    displayName: req.session.displayName,
    isHost: req.session.isHost === true,
    roomId: req.session.roomId
  });
};


/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const deleteParticipant = async (req, res) => {
  const participantID = req.body.participantId;

  if (!Object.keys(participantID ?? {}).length) {

    // TODO: add a res.redirect() to the user input page for creating username
    //
    return res.status(400);
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM participants WHERE id = ?',
      [participantID]
    );
    if (result.affectedRows == 0) {
      return res.json({
        success: false,
        affectedRows: result.affectedRows
      })
    }
    return res.json({
      success: true,
      affectedRows: result.affectedRows,
    })
  }
  catch (error) {
    console.log(error)
    res.json({
      error: error
    });
  }


  return res
};

export const abandonSession = async (req, res) => {
  const participantId = req.session?.participantId;

  if (!participantId) {
    return res.status(401).json({
      success: false,
      message: "No active session"
    });
  }

  try {
    // Delete only the currently authenticated participant
    await pool.execute(
      'DELETE FROM participants WHERE id = ?',
      [participantId]
    );

    // Destroy the current Express session and clear the session cookie
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session error"
        });
      }
      res.clearCookie("room_session");
      return res.status(200).json({
        success: true,
        message: "Session abandoned successfully"
      });
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
