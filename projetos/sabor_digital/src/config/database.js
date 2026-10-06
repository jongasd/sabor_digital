const fs = require("fs");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Aiven (e a maioria dos MySQL em nuvem) exige SSL.
// DB_SSL=true liga o SSL; DB_SSL_CA=./ca.pem (opcional) valida o certificado do servidor.
let ssl;
if (process.env.DB_SSL === "true") {
  ssl = process.env.DB_SSL_CA
    ? { ca: fs.readFileSync(process.env.DB_SSL_CA), rejectUnauthorized: true }
    : { rejectUnauthorized: false };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "sabordigital",
  port: Number(process.env.DB_PORT) || 3306,
  ssl,
  decimalNumbers: true, // DECIMAL volta como número, não como string
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,
});

module.exports = pool;
