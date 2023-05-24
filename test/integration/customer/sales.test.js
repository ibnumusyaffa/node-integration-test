const request = require('supertest');
const app = require('../../../app/app');
const { expect } = require('chai');
const knex = require('../../../app/db');
const { createToken } = require('../../util/auth');

describe('/sales', () => {
  describe('POST /sales/checkout', () => {
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

    it('should return validation errors for insufficient stock', async () => {
      // Create a test product
      const product = {
        name: 'Test Product',
        description: 'A test product',
        price: 9.99,
        stock: 1, // Set stock to 1 for testing insufficient stock scenario
      };
      const [productId] = await knex('products').insert(product);

      // Define the checkout payload
      const payload = {
        products: [
          {
            id: productId,
            quantity: 2, // Requesting 2 quantities while stock is only 1
          },
        ],
      };

      // Send the checkout request
      const initialCount = await knex('sales').count('* as count').first();
      const res = await request(app)
        .post('/sale/checkout')
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .send(payload);

      // Check the response
      expect(res.status).to.equal(422);
      expect(res.body).to.have.property(
        'message',
        'Insufficient stock for a product'
      );

      //check sales table not increased
      const updatedCount = await knex('sales').count('* as count').first();
      expect(updatedCount.count).to.equal(initialCount.count);

      // Check that the product stock remains unchanged
      const updatedProduct = await knex('products')
        .where('id', productId)
        .select('stock')
        .first();
      expect(updatedProduct).to.exist;
      expect(updatedProduct.stock).to.equal(1); // Stock should remain at 1
    });

    it('should handle concurrent checkout without race condition', async function () {
      this.timeout(10000); // Increase the timeout for the test

      // Create a test product
      const product = {
        name: 'Test Product',
        description: 'A test product',
        price: 9.99,
        stock: 1, // Set stock to 1 for testing insufficient stock scenario
      };
      const [productId] = await knex('products').insert(product);

      // Define the checkout payload
      const payload = {
        products: [
          {
            id: productId,
            quantity: 1,
          },
        ],
      };

      const checkoutPromises = [];


      const concurrentUsers = 5;
      // Concurrently initiate checkout requests by multiple users
      for (let i = 0; i < concurrentUsers; i++) {
        const checkoutPromise = request(app)
          .post('/sale/checkout')
          .auth(createToken('admin@example.com'), { type: 'bearer' })
          .send(payload);
        checkoutPromises.push(checkoutPromise);
      }

      // Wait for all checkout requests to complete
      const checkoutResults = await Promise.all(checkoutPromises);

      // Check the results
      expect(checkoutResults).to.have.lengthOf(concurrentUsers);

      // Check the final stock of the product
      const finalProduct = await knex('products')
        .where('id', productId)
        .first();
      expect(finalProduct.stock).to.equal(0);
    });
  });

  describe('GET /sales/history', () => {
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

      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /sales/:saleId', () => {
    it('should return the details of a specific sale for the authenticated user', async () => {
      // Create a dummy user
      const user = await knex('users')
        .where('email', 'admin@example.com')
        .first();

      // Create a dummy product
      const [productId] = await knex('products').insert({
        name: 'Product 1',
        description: 'Dummy product',
        price: 9.99,
        stock: 10,
      });

      // Create a dummy sale
      const [saleId] = await knex('sales').insert({
        total: 9.99,
        user_id: user.id,
        created_at: new Date(),
      });

      // Create a pivot table entry
      await knex('sales_product').insert({
        sale_id: saleId,
        product_id: productId,
        quantity: 1,
      });

      const res = await request(app)
        .get(`/sale/${saleId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .expect(200);

      expect(res.body.data).to.have.property('id', saleId);
      expect(res.body.data).to.have.property('total', '9.99');
      expect(res.body.data).to.have.property('user_id', user.id);
      expect(res.body.data).to.have.property('created_at');
      expect(res.body.data.products).to.be.an('array');
      expect(res.body.data.products).to.have.lengthOf(1);
    });

    it('should return a 404 error if the sale is not found', async () => {
      const nonExistingSaleId = 9999;
      const res = await request(app)
        .get(`/sale/${nonExistingSaleId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .expect(404);

      expect(res.body).to.have.property('message', 'Sale not found');
    });

    it('should return a 404 error if the sale belongs to another user', async () => {
      // Create dummy users
      const user1 = await knex('users')
        .where('email', 'admin@example.com')
        .first();
      const user2 = await knex('users')
        .where('email', 'customer@example.com')
        .first();

      // Create a dummy product
      const [productId] = await knex('products').insert({
        name: 'Product 1',
        description: 'Dummy product',
        price: 9.99,
        stock: 10,
      });

      // Create a dummy sale belonging to user1
      const [saleId] = await knex('sales').insert({
        total: 9.99,
        user_id: user1.id,
        created_at: new Date(),
      });

      // Create a pivot table entry
      await knex('sales_product').insert({
        sale_id: saleId,
        product_id: productId,
        quantity: 1,
      });

      const res = await request(app)
        .get(`/sale/${saleId}`)
        .auth(createToken(user2.email), { type: 'bearer' })
        .expect(404);

      expect(res.body).to.have.property('message', 'Sale not found');
    });
  });
});
