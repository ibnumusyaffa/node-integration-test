const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator'),
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

  app.use(router);
};
