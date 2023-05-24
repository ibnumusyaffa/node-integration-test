// controller
const userController = require('../controllers/admin/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/admin/productController');
const adminSaleContoller = require('../controllers/admin/saleController');

const saleContoller = require('../controllers/customer/saleContoller');


// middleware
const checkRole = require('../middlewares/checkRole');
const { checkAuth } = require('../middlewares/auth');
// validator
const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator'),
  product: require('../validators/productValidator'),
  checkout: require('../validators/checkoutValidator'),
};

module.exports = (app) => {
  const router = require('express').Router();

  router.post('/login', authController.login);
  router.get('/profile', checkAuth, authController.profile);

  router.get('/admin/user', checkAuth, checkRole('admin'), userController.list);
  router.get(
    '/admin/user/:id',
    checkAuth,
    checkRole('admin'),
    userController.detail
  );
  router.post(
    '/admin/user',
    checkAuth,
    checkRole('admin'),
    validate(rule.user.create),
    userController.create
  );
  router.put(
    '/admin/user/:id',
    checkAuth,
    checkRole('admin'),
    validate(rule.user.update),
    userController.update
  );
  router.delete(
    '/admin/user/:id',
    checkAuth,
    checkRole('admin'),
    userController.delete
  );

  router.get(
    '/admin/product',
    checkAuth,
    checkRole('admin'),
    productController.list
  );
  router.get(
    '/admin/product/:id',
    checkAuth,
    checkRole('admin'),
    productController.detail
  );
  router.post(
    '/admin/product',
    checkAuth,
    checkRole('admin'),
    validate(rule.product.create),
    productController.create
  );
  router.put(
    '/admin/product/:id',
    checkAuth,
    checkRole('admin'),
    validate(rule.product.update),
    productController.update
  );
  router.delete(
    '/admin/product/:id',
    checkAuth,
    checkRole('admin'),
    productController.delete
  );

  router.get(
    '/admin/sale/history',
    checkAuth,
    checkRole('admin'),
    adminSaleContoller.history
  );
  router.get(
    '/admin/sale/:id',
    checkAuth,
    checkRole('admin'),
    adminSaleContoller.detail
  );

  router.post(
    '/sale/checkout',
    checkAuth,
    validate(rule.checkout.validateCheckout),
    saleContoller.checkout
  );

  router.get('/sale/history', checkAuth, saleContoller.history);
  router.get('/sale/:id', checkAuth, saleContoller.detail);

  app.use(router);
};
