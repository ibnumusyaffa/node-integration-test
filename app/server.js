const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const port = process.env.NODE_PORT || 3000;

app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.static('public'));
app.use('/storage', express.static('storage/app'));

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log('server listening to', port);
  });
}

require('./routes')(app);

//global error handle
app.use(function (err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  console.error(err);
  let message = isProd ? 'Internal server error' : err.message;
  return res.status(500).send({
    message: message,
  });
});

module.exports = app;
