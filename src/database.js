const mysql = require('mysql');
const { promisify } = require ('util');
const { database } = require('./keys');

const conn = mysql.createPool(database);

conn.getConnection((err, connection) =>{
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('DATABASE CONNECTION WAST LOST');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('DATABASE HAS TOO MANY CONNECTIONS');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNECTION HAS REFUSED');
        }
    }
    if (connection) connection.release();
    console.log('BASE DE DATOS CONECTADA');
    return;
});

conn.query = promisify(conn.query)

module.exports = conn;