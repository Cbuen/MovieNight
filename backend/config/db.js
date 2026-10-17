import "dotenv/config";
import mysql from "mysql2/promise";

const caCertificate = process.env.DB_SSL_CA
  ?.replace(/\\n/g, "\n")
  .trim();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootroot",
  database: process.env.DB_NAME || "movieNight",

  ssl: process.env.DB_SSL === "true"
    ? {
      ca: caCertificate,
      rejectUnauthorized: true
    }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
