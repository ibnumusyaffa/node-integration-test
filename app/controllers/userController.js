const knex = require('../database');
const bcrypt = require('bcryptjs');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page of 1
    const limit = parseInt(req.query.limit) || 10; // default limit of 10
    const offset = (page - 1) * limit; // calculate offset based on page and limit

    const query = () =>
      knex.table('users').modify((queryBuilder) => {
        queryBuilder.where(function () {
          if (req.query.email) {
            this.where('email', req.query.email);
          }
        });
      });

    const users = await query()
      .orderBy('id', 'asc')
      .limit(limit)
      .offset(offset);

    const [count] = await query().count('*', { as: 'count' });

    const totalPages = Math.ceil(count.count / limit); // calculate total number of pages
    return res.json({
      data: users,
      total: count.count,
      limit: limit,
      currentPage: page,
      totalPages: totalPages,
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

    const createdUser = await knex('users').insert(user);

    return res.json({
      data: createdUser[0],
      message: 'User created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;
  try {
    const deletedUser = await knex('users').where('id', id).del();

    if (deletedUser) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return next(error);
  }
};
