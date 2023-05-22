const env = process.env.NODE_ENV || 'development';
const config = require('../../config/db')[env];
const db = require('knex')(config);

module.exports = db;
