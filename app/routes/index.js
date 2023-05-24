const userController = require('../controllers/admin/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/admin/productController');
const saleContoller = require('../controllers/customer/saleContoller');

const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator'),
  product: require('../validators/productValidator'),
  checkout: require('../validators/checkoutValidator'),
};

const { checkAuth } = require('../middlewares/auth');

module.exports = (app) => {
  const router = require('express').Router();

  router.post('/login', authController.login);
  router.get('/profile', checkAuth, authController.profile);

  router.get('/admin/user', checkAuth, userController.list);
  router.get('/admin/user/:id', checkAuth, userController.detail);
  router.post(
    '/admin/user',
    checkAuth,
    validate(rule.user.create),
    userController.create
  );
  router.put(
    '/admin/user/:id',
    checkAuth,
    validate(rule.user.update),
    userController.update
  );
  router.delete('/admin/user/:id', checkAuth, userController.delete);

  router.get('/admin/product', checkAuth, productController.list);
  router.get('/admin/product/:id', checkAuth, productController.detail);
  router.post(
    '/admin/product',
    checkAuth,
    validate(rule.product.create),
    productController.create
  );
  router.put(
    '/admin/product/:id',
    checkAuth,
    validate(rule.product.update),
    productController.update
  );
  router.delete('/admin/product/:id', checkAuth, productController.delete);

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
