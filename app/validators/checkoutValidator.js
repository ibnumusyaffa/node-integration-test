const { body } = require('express-validator');
exports.validateCheckout = [
  // Validate the products array
  body('products').isArray().withMessage('Products must be an array'),
  body('products.*.id').exists().withMessage('Product ID is required'),
  body('products.*.quantity')
    .exists()
    .withMessage('Product quantity is required')
    .isInt({ min: 1 })
    .withMessage('Product quantity must be a positive integer'),
];

