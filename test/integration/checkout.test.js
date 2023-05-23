const request = require('supertest');
const app = require('../../app/app');
const { expect } = require('chai');
const knex = require('../../app/db');
const { createToken } = require('../util/auth');

describe('POST /checkout', () => {
  it('should checkout and create a new sale with valid data', async () => {
    // Create a test product
    const product = {
      name: 'Test Product',
      description: 'A test product',
      price: 9.99,
      stock: 10,
    };
    const [productId] = await knex('products').insert(product);

    // Define the checkout payload
    const payload = {
      products: [
        {
          id: productId,
          quantity: 2,
        },
      ],
    };

    // Send the checkout request
    const res = await request(app)
      .post('/sale/checkout')
      .auth(createToken('admin@example.com'), { type: 'bearer' })
      .send(payload);

    // Check the response
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Checkout successful');
    expect(res.body).to.have.property('saleId');

    // Check the database for the created sale
    const sale = await knex('sales').where('id', res.body.saleId).first();
    expect(sale).to.exist;
    expect(parseFloat(sale.total)).to.equal(19.98); // 2 * 9.99

    // Check the database for the sale products
    const saleProducts = await knex('sales_product')
      .where('sale_id', sale.id)
      .select();

    // Check the database for the updated product stock
    expect(saleProducts).to.have.lengthOf(1);
    expect(saleProducts[0].product_id).to.equal(productId);
    expect(saleProducts[0].quantity).to.equal(2);

    const updatedProduct = await knex('products')
      .where('id', productId)
      .select('stock')
      .first();
    expect(updatedProduct).to.exist;
    expect(updatedProduct.stock).to.equal(8);
  });

  it('should return an error if product does not exist', async () => {
    // Define the checkout payload with a non-existent product ID
    const payload = {
      products: [
        {
          id: 9999,
          quantity: 1,
        },
      ],
    };

    // Send the checkout request
    const res = await request(app)
      .post('/sale/checkout')
      .auth(createToken('admin@example.com'), { type: 'bearer' })
      .send(payload);

    // Check the response
    expect(res.statusCode).to.equal(422);
    expect(res.body).to.have.property('message', 'Product not found');
  });

  it('should return validation errors for invalid payload', async () => {
    // Define an invalid checkout payload with missing required fields
    const payload = {
      products: [
        {
          // Missing 'id' and 'quantity'
        },
      ],
    };

    // Send the checkout request
    const res = await request(app)
      .post('/sale/checkout')
      .auth(createToken('admin@example.com'), { type: 'bearer' })
      .send(payload);

    // Check the response
    expect(res.status).to.equal(422);
    expect(res.body).to.have.property('errors');
  });

  it('should return the checkout history for the authenticated user', async () => {
    // Create dummy products
    const user = await knex('users')
      .where('email', 'admin@example.com')
      .first();

    const [product1Id] = await knex('products').insert({
      name: 'Product 1',
      description: 'Dummy product 1',
      price: 9.99,
      stock: 10,
    });
    const [product2Id] = await knex('products').insert({
      name: 'Product 2',
      description: 'Dummy product 2',
      price: 19.99,
      stock: 5,
    });

    // Create dummy sales
    await knex('sales').insert([
      {
        total: 19.98,
        user_id: user.id,
        created_at: new Date(),
      },
      {
        total: 39.98,
        user_id: user.id,
        created_at: new Date(),
      },
    ]);

    // Create pivot table entries
    await knex('sales_product').insert([
      {
        sale_id: 1,
        product_id: product1Id,
        quantity: 2,
      },
      {
        sale_id: 2,
        product_id: product2Id,
        quantity: 2,
      },
    ]);

    const res = await request(app)
      .get('/sale/history')
      .auth(createToken('admin@example.com'), { type: 'bearer' })
      .expect(200);
  });
});
