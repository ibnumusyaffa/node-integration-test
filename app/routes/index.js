const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator'),
  product: require('../validators/productValidator'),
};

const { checkAuth } = require('../middlewares/auth');

module.exports = (app) => {
  const router = require('express').Router();

  router.post('/login', authController.login);
  router.get('/profile', checkAuth, authController.profile);

  router.get('/user', checkAuth, userController.list);
  router.get('/user/:id', checkAuth, userController.detail);
  router.post(
    '/user',
    checkAuth,
    validate(rule.user.create),
    userController.create
  );
  router.put(
    '/user/:id',
    checkAuth,
    validate(rule.user.update),
    userController.update
  );
  router.delete('/user/:id', checkAuth, userController.delete);

  router.get('/product', checkAuth, productController.list);
  router.get('/product/:id', checkAuth, productController.detail);
  router.post(
    '/product',
    checkAuth,
    validate(rule.product.create),
    productController.create
  );
  router.put(
    '/product/:id',
    checkAuth,
    validate(rule.product.update),
    productController.update
  );
  router.delete('/product/:id', checkAuth, productController.delete);

  app.use(router);
};
