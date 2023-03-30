const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const consola = require('consola');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.static('public'));
app.use('/storage', express.static('storage/app'));

require('./routes')(app);

app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    console.error(err);
    return res.status(500).send({
      message: 'Internal server error',
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    consola.log("aaa")
    consola.error(err);
  }

  return res.status(500).send({
    message: err.message,
  });
});

module.exports = app;
