const dotenv = require('dotenv');
dotenv.config();

const migrations = {
  tableName: 'migrations',
  directory: './database/migrations',
};
const seeds = {
  directory: './database/seeders',
};
const pool = {
  max: 100,
  min: 2,
  acquireTimeoutMillis: 300000,
  idleTimeoutMillis: 30000,
};

const config = {
  development: {
    client: 'mysql2',
    connection: {
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_DATABASE,
      host: process.env.DEV_DB_HOST,
      port: process.env.DEV_DB_PORT,
    },
    pool,
    migrations,
    seeds,
  },
  test: {
    client: 'mysql2',
    connection: {
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
      database: process.env.TEST_DB_DATABASE,
      host: process.env.TEST_DB_HOST,
      port: process.env.TEST_DB_PORT,
    },
    pool,
    migrations,
    seeds,
  },
  production: {
    client: 'mysql2',
    connection: {
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_DATABASE,
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT,
    },
    pool,
    migrations,
    seeds,
  },
};

module.exports = config;
