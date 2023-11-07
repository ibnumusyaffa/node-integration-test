const { body } = require('express-validator');
const User = require('../db/user');
let create = [
  body('email')
    .notEmpty()
    .isEmail()
    .custom(async (value) => {
      const user = await User.query().where('email', value).first();

      if (user) {
        return Promise.reject('Email already in use');
      }
      return true;
    }),
  body('fullname').notEmpty().isLength({ min: 1 }),
  body('password').notEmpty().isLength({ min: 6 }),
];

let update = [
  body('email')
    .notEmpty()
    .isEmail()
    .custom(async (value, { req, res }) => {
      const id = req.params.id;
      const user = await User.query()
        .where('email', value)
        .whereNot('id', id)
        .first();
      if (user) {
        return Promise.reject('Email already in use');
      }
      return true;
    }),
  body('fullname').notEmpty().isLength({ min: 1 }),
  body('password').optional().isLength({ min: 6 }),
];

module.exports = {
  create,
  update,
};
