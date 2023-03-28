const dotenv = require('dotenv')
dotenv.config()
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_DATABASE,
    host: process.env.DEV_DB_HOST,
    post: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_DIALECT,
    logging: false,
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_DATABASE,
    host: process.env.TEST_DB_HOST,
    post: process.env.TEST_DB_PORT,
    dialect: process.env.TEST_DB_DIALECT,
    logging: false,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_DATABASE,
    host: process.env.PROD_DB_HOST,
    post: process.env.PROD_DB_PORT,
    dialect: process.env.PROD_DB_DIALECT,
    logging: false,
  },
}
