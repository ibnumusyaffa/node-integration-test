const request = require('supertest');
const app = require('../../app/app');
const assert = require('chai').assert;
const knex = require('../../app/db');
const { faker } = require('@faker-js/faker');
const { assertDbHasOne, assertDbMissing } = require('../util/db');
const { createToken } = require('../util/auth');

describe('CRUD product', () => {
  describe('GET /product', () => {
    it('returns a list of products', async () => {
      const res = await request(app)
        .get('/product')
        .auth(createToken('admin@example.com'), { type: 'bearer' });
      assert.isArray(res.body.data, 'data is an array');
      assert.isNumber(res.body.meta.total, 'total is a number');
      assert.isNumber(res.body.meta.limit, 'limit is a number');
      assert.isNumber(res.body.meta.totalPages, 'totalPages is a number');

      const productCount = await knex('products').count('* as count').first();

      assert.equal(res.body.meta.total, productCount.count, 'total is correct');
    });

    it('returns a filtered list of products with name parameter', async () => {
      // Prepare data
      const insertedProduct = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };
      await knex('products').insert(insertedProduct);

      const res = await request(app)
        .get('/product')
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .query({ name: insertedProduct.name });
      assert.equal(
        res.body.data[0].name,
        insertedProduct.name,
        'name is correct'
      );
      assert.equal(res.body.meta.total, 1, 'total is correct');
    });
  });

  describe('POST /product', () => {
    it('should create a new product with valid data', async () => {
      // Prepare data
      const body = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };

      // Send data
      const res = await request(app)
        .post('/product')
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .send(body);
      // Check if status code is 200
      assert.equal(res.statusCode, 200);

      await assertDbHasOne('products', {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
      });
    });
  });

  describe('PUT /product', () => {
    it('should update a product with valid data', async () => {
      // Prepare data
      const insertedProduct = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };
      const [productId] = await knex('products').insert(insertedProduct);

      const newData = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };

      const res = await request(app)
        .put(`/product/${productId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .send(newData);

      assert.equal(res.statusCode, 200);
      await assertDbHasOne('products', {
        id: productId,
        name: newData.name,
        description: newData.description,
        price: newData.price,
        stock: newData.stock,
      });
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product with the given id', async () => {
      // Prepare data
      const insertedProduct = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };
      const [productId] = await knex('products').insert(insertedProduct);

      const res = await request(app)
        .get(`/product/${productId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.name, insertedProduct.name);
    });

    it('should return an error if product does not exist', async () => {
      const res = await request(app)
        .get('/product/9999')
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Product not found');
    });
  });

  describe('DELETE /product', () => {
    it('should delete a product', async () => {
      // Prepare data
      const insertedProduct = {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.commerce.price(),
        stock: faker.random.numeric(),
      };
      const [productId] = await knex('products').insert(insertedProduct);

      const res = await request(app)
        .delete(`/product/${productId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'Product deleted successfully');

      await assertDbMissing('products', { id: productId });
    });

    it('should return an error if product does not exist', async () => {
      const res = await request(app)
        .delete('/product/9999')
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Product not found');
    });
  });
});
