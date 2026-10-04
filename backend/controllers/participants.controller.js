// API functions for participants DB table interaction

import { pool } from '../config/db.js';

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const createParticipant = async (req, res) => {
  req.session.regenerate();
  const displayName = req.body.displayName;
  const name = displayName?.trim();

  //TODO: CHECK FOR SPACES/EMPTYNESS
  if (
    typeof displayName !== "string" ||
    name.length === 0
  ) {
    res.status(400);
    return res.json("Error empty or incorrect participant name")
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO participants (display_name) VALUES (?)',
      [displayName]
    );
    req.session.participantId = result.insertId;
    req.session.isHost = false;
    return res.json(`${displayName} has been created!`);

  }
  catch (error) {
    res.json({
      error: error
    })
  }
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
      `DELETE FROM participants WHERE id = ${participantID}`
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
