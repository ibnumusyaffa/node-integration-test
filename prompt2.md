generate test for checkout api with test case : Invalid Product ID

POST /checkout
Body  

```json
{
  products: [
    {
      id: productId,
      quantity: 2
    },
  ],
};

```

with example like this

```javascript
const request = require('supertest');
const app = require('../../../app/app');
const assert = require('chai').assert;
const knex = require('../../../app/db');

const { assertDbHasOne, assertDbMissing } = require('../../util/db');
const { createToken } = require('../../util/auth');
const productBuilder = require('../../factory/product');

describe('/admin/product', () => {
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
});

```