const knex = require('../database');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page of 1
    const limit = parseInt(req.query.limit) || 10; // default limit of 10
    const offset = (page - 1) * limit; // calculate offset based on page and limit

    const query = () =>
      knex.table('users').modify((queryBuilder) => {
        queryBuilder.where(function () {
          if (req.query.keyword && isNaN(req.query.keyword)) {
            this.where('email', 'like', `%${req.query.keyword}%`);
          }
        });
      });

    const users = await query()
      .orderBy('id', 'asc')
      .limit(limit)
      .offset(offset);

    const [count] = await query().count('*', {as: 'count'});

    const totalPages = Math.ceil(count.count / limit); // calculate total number of pages
    return res.json({
      data: users,
      total: count.count,
      limit: limit,
      currentPage:page,
      totalPages: totalPages,
    });
  } catch (error) {
    return next(error);
  }
};
