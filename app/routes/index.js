module.exports = (app) => {
  const router = require('express').Router();
  const user = require('../controllers/user.controller');

  router.get('/', user.detail);

  app.use(router);
};
