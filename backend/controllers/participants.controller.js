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
    // add a res.redirect() to the user input page for creating username
  }
  const [result] = await pool.execute(
    'INSERT INTO participants (display_name) VALUES (?)',
    [displayName]
  );

  return res.json(`${displayName} has been created!\n result of pool ${result}`);
};


