const Sale = require('../../db/sale');

exports.history = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default page of 1
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10

    // Fetch the checkout history for the user with pagination
    const query = Sale.query()
      .withGraphFetched('[products]')
      .select('id', 'total', 'created_at')
      .orderBy('created_at', 'desc')
      .page(page - 1, limit);

    const result = await query;

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
    next(error);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const saleId = req.params.id; // Assuming the sale ID is provided in the request parameters

    // Fetch the sale details including associated products
    const sale = await Sale.query()
      .findById(saleId)
      .withGraphFetched('[products]');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    return res.json({ data: sale });
  } catch (error) {
    return next(error);
  }
};
module.exports = exports;
