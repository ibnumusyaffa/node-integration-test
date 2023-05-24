const request = require('supertest');
const app = require('../../../app/app');
const assert = require('chai').assert;
const knex = require('../../../app/db');
const { faker } = require('@faker-js/faker');
const { assertDbHasOne, assertDbMissing } = require('../../util/db');
const { createToken } = require('../../util/auth');
const userBuilder = require('../../factory/user');
describe('/admin/user', () => {
  describe('GET /admin/user', () => {
    it('returns a list of users', async () => {
      const res = await request(app)
        .get('/admin/user')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        });
      assert.isArray(res.body.data, 'data is an array');
      assert.isNumber(res.body.meta.total, 'total is a number');
      assert.isNumber(res.body.meta.limit, 'limit is a number');
      assert.isNumber(res.body.meta.totalPages, 'totalPages is a number');

      const userCount = await knex('users').count('* as count').first();

      assert.equal(res.body.meta.total, userCount.count, 'total is correct');
    });

    it('returns a filtered list of users with email paramater', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      await knex('users').insert(insertedUser);
      const res = await request(app)
        .get('/admin/user')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .query({ email: insertedUser.email });

      assert.equal(
        res.body.data[0].email,
        insertedUser.email,
        'email is correct'
      );
      assert.equal(res.body.meta.total, 1, 'total is correct');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .get('/admin/user')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('POST /admin/user', () => {
    it('should create a new user with valid data', async () => {
      //prepare data
      const body = userBuilder.one();

      //send data
      const res = await request(app)
        .post('/admin/user')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .send({ ...body, password: 'password' });
      //check if status code is 200
      assert.equal(res.statusCode, 200);

      await assertDbHasOne('users', {
        email: body.email,
        role_id: body.role_id,
        fullname: body.fullname,
      });
    });

    it('should return an error if email is already in use', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      await knex('users').insert(insertedUser);

      // send data
      const res = await request(app)
        .post('/admin/user')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .send({
          email: insertedUser.email,
          role_id: 1,
          fullname: 'Test User',
          password: 'password123',
        });

      //expected response
      assert.equal(res.statusCode, 422);
      assert.isString(res.body.errors.email, 'errors.email is string');
    });
    it('should return an error if role_id is not valid', async () => {
      // send data
      const email = faker.internet.email();
      const res = await request(app)
        .post('/admin/user')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .send({
          email: email,
          role_id: 0,
          fullname: 'Test User',
          password: 'password123',
        });

      //expected response
      assert.equal(res.statusCode, 422);
      assert.equal(res.body.errors.role_id, 'role id is not valid');
      //expected db state
      await assertDbMissing('users', {
        email,
      });
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .post('/admin/user')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('PUT /admin/user', () => {
    it('should update a new user with valid data', async () => {
      //prepare data
      const body = userBuilder.one();
      let [id] = await knex('users').insert(body);

      const newData = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        role_id: 2,
      };
      const res = await request(app)
        .put(`/admin/user/${id}`)
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .send(newData);

      assert.equal(res.statusCode, 200);
      await assertDbHasOne('users', {
        id: id,
        email: newData.email,
        fullname: newData.fullname,
        role_id: newData.role_id,
      });
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .put('/admin/user/9999')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('GET /admin/user/:id', () => {
    it('should return user with given id', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      const [id] = await knex('users').insert(insertedUser);
      const res = await request(app)
        .get(`/admin/user/${id}`)
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.email, insertedUser.email);
    });

    it('should return an error if user does not exist', async () => {
      const res = await request(app)
        .get('/admin/user/9999')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        });
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .get('/admin/user/9999')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });

  describe('DELETE /admin/user', () => {
    it('should delete a user', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      const [id] = await knex('users').insert(insertedUser);
      const res = await request(app)
        .delete(`/admin/user/${id}`)
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'User deleted successfully');

      await assertDbMissing('users', {
        id: id,
      });
    });

    it('should return an error if user does not exist', async () => {
      const res = await request(app)
        .delete('/admin/user/9999')
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        });
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });

    it('returns a 403 error for a non-admin user', async () => {
      const res = await request(app)
        .delete('/admin/user/9999')
        .auth(createToken('customer@example.com'), { type: 'bearer' })
        .expect(403);

      assert.equal(res.body.message, 'Access denied');
    });
  });
});
