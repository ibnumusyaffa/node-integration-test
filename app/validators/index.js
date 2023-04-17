const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    // transform error message to key:message format
    const formatted = {};
    for await (let error of errors.array()) {
      formatted[error.param] = error.msg;
    }

    return res.status(422).json({
      message: 'Periksa kembali data yang anda masukkan',
      errors: formatted,
    });
  };
};

module.exports = { validate };
