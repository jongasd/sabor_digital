const mysql = require('mysql2/promise');
const path = require('path');

// Caminho absoluto até a raiz do projeto: independente de você rodar
// "node server.js" de dentro de src/ ou "node src/server.js" da raiz,
// o .env sempre é encontrado no mesmo lugar (raiz do projeto, ao lado
// do package.json).
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Pool de conexões com MySQL usando Promises
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sabordigital',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;