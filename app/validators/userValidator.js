const { body } = require('express-validator');
const knex = require('../db');
let create = [
  body('email')
    .isEmail()
    .custom(async (value) => {
      const user = await knex('users').where('email', value).first();

      if (user) {
        return Promise.reject('Email already in use');
      }
    }),
  body('fullname').isLength({ min: 1 }),
  body('password').isLength({ min: 6 }),
];

module.exports = {
  create,
};
