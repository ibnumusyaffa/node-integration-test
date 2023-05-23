const Sale = require('../db/sale');
const SaleProduct = require('../db/sale_product');
const Product = require('../db/product');

exports.checkout = async (req, res, next) => {
  try {
    const { products } = req.body;

    // Calculate the total price
    let totalPrice = 0;
    for (const product of products) {
      const { id, quantity } = product;
      const foundProduct = await Product.query().findById(id);
      if (!foundProduct) {
        return res.status(422).json({ message: 'Product not found' });
      }
      totalPrice += foundProduct.price * quantity;

      await Product.query().findById(id).decrement('stock', quantity);
    }

    // Create a new sale
    const sale = await Sale.query().insert({
      total: totalPrice,
      user_id: req.user.id, // assuming the user ID is available in req.user
    });

    // Create sale products
    const saleProducts = [];
    for (const product of products) {
      const { id, quantity } = product;
      saleProducts.push({
        sale_id: sale.id,
        product_id: id,
        quantity: quantity,
      });
    }
    await SaleProduct.query().insertGraph(saleProducts);

    return res.json({
      message: 'Checkout successful',
      saleId: sale.id,
    });
  } catch (error) {
    return next(error);
  }
};

exports.history = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming the user ID is available in req.user
    const page = parseInt(req.query.page) || 1; // Default page of 1
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10

    // Fetch the checkout history for the user with pagination
    const query = Sale.query()
      .withGraphFetched('[products]')
      .select('id', 'total', 'created_at')
      .where('user_id', userId)
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

module.exports = exports;
