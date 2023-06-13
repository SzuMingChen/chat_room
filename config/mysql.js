const mysql = require("mysql2/promise");
//* npm i dotenv
require('dotenv').config();

//* 使用 process.env 
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
});

module.exports = connection;
