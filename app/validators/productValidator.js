const { body } = require('express-validator');
const create = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isDecimal()
    .withMessage('Price must be a decimal number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt()
    .withMessage('Stock must be an integer'),
];

const update = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isDecimal()
    .withMessage('Price must be a decimal number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt()
    .withMessage('Stock must be an integer'),
];

module.exports = {
  create,
  update,
};
