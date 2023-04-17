const { validate } = require('../validators/index');
const rule = {
  user: require('../validators/userValidator'),
};

module.exports = (app) => {
  const router = require('express').Router();
  const userController = require('../controllers/userController');

  router.get('/user', userController.list);
  router.post('/user', validate(rule.user.create), userController.create);
  router.delete('/user/:id', userController.delete);

  app.use(router);
};
