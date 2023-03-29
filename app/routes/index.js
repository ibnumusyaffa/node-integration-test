module.exports = (app) => {
  const router = require('express').Router();
  const userController = require('../controllers/userController');

  router.get('/', userController.list);

  app.use(router);
};
