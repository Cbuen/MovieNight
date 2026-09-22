// API functions for participants DB table interaction

import { pool } from '../config/db.js';

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const createParticipant = async (req, res) => {
  const displayName = req.body.displayName;
  if (!Object.keys(displayName ?? {}).length) {
    return res.status(400)
    // TODO: add a res.redirect() to the user input page for creating username
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO participants (display_name) VALUES (?)',
      [displayName]
    );
    console.log(result);
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
