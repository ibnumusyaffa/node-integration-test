const request = require('supertest');
const app = require('../../../app/app');
const { expect } = require('chai');
const knex = require('../../../app/db');
const { createToken } = require('../../util/auth');
const productBuilder = require('../../factory/product');

describe('/admin/sale', () => {
  describe('GET /admin/sale/history', () => {
    it('should return the checkout history for the authenticated user', async () => {
      // Create dummy products
      const user = await knex('users')
        .where('email', 'admin@example.com')
        .first();

      const product1 = productBuilder.one();
      const product2 = productBuilder.one();

      const [product1Id] = await knex('products').insert(product1);
      const [product2Id] = await knex('products').insert(product2);

      // Create dummy sales
      await knex('sales').insert([
        {
          total: product1.price * 2,
          user_id: user.id,
          created_at: new Date(),
        },
        {
          total: product2.price * 2,
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
        .get('/admin/sale/history')
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      expect(res.body.data).to.be.an('array');
    });
  });

  describe('GET /admin/sales/:saleId', () => {
    it('should return the details of a specific sale for the authenticated user', async () => {
      // Create a dummy user
      const user = await knex('users')
        .where('email', 'admin@example.com')
        .first();

      // Create a dummy product
      const product = productBuilder.one()
      const [productId] = await knex('products').insert(product);

      // Create a dummy sale
      const [saleId] = await knex('sales').insert({
        total: product.price,
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
        .get(`/admin/sale/${saleId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .expect(200);

      expect(res.body.data).to.have.property('id', saleId);
      expect(res.body.data).to.have.property('total', product.price);
      expect(res.body.data).to.have.property('user_id', user.id);
      expect(res.body.data).to.have.property('created_at');
      expect(res.body.data.products).to.be.an('array');
      expect(res.body.data.products).to.have.lengthOf(1);
    });

    it('should return a 404 error if the sale is not found', async () => {
      const nonExistingSaleId = 9999;
      const res = await request(app)
        .get(`/admin/sale/${nonExistingSaleId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .expect(404);

      expect(res.body).to.have.property('message', 'Sale not found');
    });

    it('admin can see sale another user', async () => {
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
        user_id: user2.id,
        created_at: new Date(),
      });

      // Create a pivot table entry
      await knex('sales_product').insert({
        sale_id: saleId,
        product_id: productId,
        quantity: 1,
      });

      const res = await request(app)
        .get(`/admin/sale/${saleId}`)
        .auth(createToken(user1.email), { type: 'bearer' });

      expect(res.body.data).to.have.property('id', saleId);
      expect(res.body.data).to.have.property('total', '9.99');
      expect(res.body.data).to.have.property('user_id', user2.id);
      expect(res.body.data).to.have.property('created_at');
      expect(res.body.data.products).to.be.an('array');
      expect(res.body.data.products).to.have.lengthOf(1);
    });
  });
});
