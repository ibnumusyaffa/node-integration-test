const request = require('supertest');
const app = require('../../../app/app');
const assert = require('chai').assert;
const knex = require('../../../app/db');

const { assertDbHasOne, assertDbMissing } = require('../../util/db');
const { createToken } = require('../../util/auth');
const productBuilder = require('../../factory/product');

describe('/admin/product', () => {
  describe('GET /admin/product', () => {
    it('returns a list of products', async () => {
      const insertedProduct = productBuilder.many(100);
      await knex('products').insert(insertedProduct);

      const res = await request(app)
        .get('/admin/product')
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
      const insertedProduct = productBuilder.one();
      await knex('products').insert(insertedProduct);

      const res = await request(app)
        .get('/admin/product')
        .auth(createToken('admin@example.com'), { type: 'bearer' })
        .query({ name: insertedProduct.name });
      assert.equal(
        res.body.data[0].name,
        insertedProduct.name,
        'name is correct'
      );
      assert.equal(res.body.meta.total, 1, 'total is correct');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .get('/admin/product')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('POST /admin/product', () => {
    it('should create a new product with valid data', async () => {
      // Prepare data
      const body = productBuilder.one();

      // Send data
      const res = await request(app)
        .post('/admin/product')
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
    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .post('/admin/product')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('PUT /admin/product', () => {
    it('should update a product with valid data', async () => {
      // Prepare data
      const insertedProduct = productBuilder.one();
      const [productId] = await knex('products').insert(insertedProduct);

      const newData = productBuilder.one();

      const res = await request(app)
        .put(`/admin/product/${productId}`)
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

      const updatedProduct = await knex('products')
        .where('id', productId)
        .first();

      assert.equal(updatedProduct.name, newData.name);
      assert.equal(updatedProduct.description, newData.description);
      assert.equal(updatedProduct.price, newData.price);
      assert.equal(updatedProduct.stock, newData.stock);
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .put(`/admin/product/99999`)
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('GET /admin/product/:id', () => {
    it('should return a product with the given id', async () => {
      // Prepare data
      const insertedProduct = productBuilder.one();
      const [productId] = await knex('products').insert(insertedProduct);

      const res = await request(app)
        .get(`/admin/product/${productId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.name, insertedProduct.name);
    });

    it('should return an error if product does not exist', async () => {
      const res = await request(app)
        .get('/admin/product/9999')
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Product not found');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .get('/admin/product')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('DELETE /admin/product', () => {
    it('should delete a product', async () => {
      // Prepare data
      const insertedProduct = productBuilder.one();
      const [productId] = await knex('products').insert(insertedProduct);

      const res = await request(app)
        .delete(`/admin/product/${productId}`)
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'Product deleted successfully');

      await assertDbMissing('products', { id: productId });
    });

    it('should return an error if product does not exist', async () => {
      const res = await request(app)
        .delete('/admin/product/9999')
        .auth(createToken('admin@example.com'), { type: 'bearer' });

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Product not found');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .delete('/admin/product/99999')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  after(() => {
    console.log('beforeAll');
  });
});
