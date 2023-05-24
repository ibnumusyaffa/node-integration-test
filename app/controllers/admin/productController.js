const Product = require('../../db/product');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // default page of 1
    const limit = parseInt(req.query.limit) || 10; // default limit of 10

    let result = Product.query();

    if (req.query.name) {
      const name = `${req.query.name.toLowerCase()}`;
      result = result.where('name', 'like', `%${name}%`);
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
    const product = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    };

    const createdProduct = await Product.query().insert(product);

    return res.json({
      data: createdProduct,
      message: 'Product created successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    const id = req.params.id;

    // Find the product to update
    const product = await Product.query().findById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Update product properties
    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;

    // Save the updated product
    const updatedProduct = await product.$query().update();

    return res.json({
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.detail = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.query().findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ data: product });
  } catch (error) {
    return next(error);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;
  try {
    const deletedProduct = await Product.query().deleteById(id);

    if (deletedProduct) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    return next(error);
  }
};
