const User = require('../db/user');
const bcrypt = require('bcryptjs');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page of 1
    const limit = parseInt(req.query.limit) || 10; // default limit of 10

    let result = User.query().modifiers({
      company: (builder) => builder.select(['id', 'uuid', 'name']),
    });

    if (req.query.email) {
      const email = `${req.query.email.toLowerCase()}`;
      result = result.where('email', email);
    }
    result = await result.orderBy('id', 'desc').page(page - 1, limit);

    const meta = {
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
    return res.send({
      meta,
      data: result.results,
    });
  } catch (error) {
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const user = {
      email: req.body.email,
      role_id: req.body.role_id,
      fullname: req.body.fullname,
      password: await bcrypt.hash('password', salt),
    };

    const createdUser = await User.query().insert(user);

    return res.json({
      data: createdUser[0],
      message: 'User created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.detail = async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.query().where('id', id).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ data: user });
  } catch (error) {
    return next(error);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;
  try {
    const deletedUser = await User.query().where('id', id).del();

    if (deletedUser) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return next(error);
  }
};
