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

  router.get('/user', userController.list);
  router.post('/user', validate(rule.user.create), userController.create);
  router.delete('/user/:id', userController.delete);

  app.use(router);
};
