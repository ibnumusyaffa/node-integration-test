const User = require('../db/user');
const bcrypt = require('bcryptjs');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page of 1
    const limit = parseInt(req.query.limit) || 10; // default limit of 10

    let result = User.query();

    if (req.query.keyword) {
      const keyword = `%${req.query.keyword.toLowerCase()}%`;
      result = result.where('fullname', 'like', keyword);
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

exports.update = async (req, res, next) => {
  try {
    const { email, fullname, password } = req.body;
    const id = req.params.id;
    // Find the user to update
    const user = await User.query().findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Update user properties
    user.email = email;
    user.fullname = fullname;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user
    const updatedUser = await user.$query().update();

    return res.json({
      data: updatedUser,
      message: 'User updated successfully',
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
