generate test for checkout api with test case : success checkout with valid data

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

```js

const request = require('supertest');
const app = require('../../../app/app');
const assert = require('chai').assert;
const knex = require('../../../app/db');
const { createToken } = require('../../util/auth');

describe('PUT /admin/product', () => {
  it('should update a product with valid data', async () => {
    // Prepare data
    const insertedProduct = {
      name: "random product",
      description: "random description",
      price: 100,
      stock: 5,
    }

    const [productId] = await knex('products').insert(insertedProduct);

    const newData = {
      name: "update product",
      description: "update description",
      price: 99,
      stock: 1
    }

    const res = await request(app)
      .put(`/admin/product/${productId}`)
      .auth(createToken('admin@example.com'), { type: 'bearer' })
      .send(newData);

    assert.equal(res.statusCode, 200);


    const updatedProduct = await knex('products')
      .where('id', productId)
      .first();

    assert.equal(updatedProduct.name, newData.name);
    assert.equal(updatedProduct.description, newData.description);
    assert.equal(updatedProduct.price, newData.price);
    assert.equal(updatedProduct.stock, newData.stock);
  });

});
```