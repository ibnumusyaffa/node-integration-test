// controller
const userController = require('../controllers/userController');

// validator
const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator')
};

module.exports = (app) => {
  const router = require('express').Router();

  router.get('/user', userController.list);
  router.get('/user/:id', userController.detail);
  router.post('/user', validate(rule.user.create), userController.create);
  router.put('/user/:id', validate(rule.user.update), userController.update);
  router.delete('/user/:id', userController.delete);

  app.use(router);
};
