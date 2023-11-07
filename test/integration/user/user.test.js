const request = require('supertest');
const app = require('../../../app/app');
const assert = require('chai').assert;
const knex = require('../../../app/db');
const { faker } = require('@faker-js/faker');
const { assertDbHasOne, assertDbMissing } = require('../../util/db');
const { createToken } = require('../../util/auth');
const userBuilder = require('../../factory/user');
describe('/user', () => {
  describe('GET /user', () => {
    it('returns a list of users', async () => {
      const res = await request(app).get('/user');

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
        .get('/user')
        .query({ keyword: insertedUser.fullname });

      assert.equal(
        res.body.data[0].fullname,
        insertedUser.fullname,
        'fullname is correct'
      );
      assert.equal(res.body.meta.total, 1, 'total is correct');
    });
  });

  describe('POST /user', () => {
    it('should create a new user with valid data', async () => {
      //prepare data
      const body = userBuilder.one();

      //send data
      const res = await request(app)
        .post('/user')
        .send({ ...body, password: 'password' });
      //check if status code is 200
      assert.equal(res.statusCode, 200);

      await assertDbHasOne('users', {
        email: body.email,
        fullname: body.fullname,
      });
    });

    it('should return an error if email is already in use', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      await knex('users').insert(insertedUser);

      // send data
      const res = await request(app).post('/user').send({
        email: insertedUser.email,
        fullname: 'Test User',
        password: 'password123',
      });

      //expected response
      assert.equal(res.statusCode, 422);
      assert.isString(res.body.errors.email, 'errors.email is string');
    });
  });

  describe('PUT /user', () => {
    it('should update a new user with valid data', async () => {
      //prepare data
      const body = userBuilder.one();
      let [id] = await knex('users').insert(body);

      const newData = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
      };
      const res = await request(app)
        .put(`/user/${id}`)
        .auth(createToken('admin@example.com'), {
          type: 'bearer',
        })
        .send(newData);

      assert.equal(res.statusCode, 200);
      await assertDbHasOne('users', {
        id: id,
        email: newData.email,
        fullname: newData.fullname,
      });
    });
  });

  describe('GET /user/:id', () => {
    it('should return user with given id', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      const [id] = await knex('users').insert(insertedUser);
      const res = await request(app).get(`/user/${id}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.email, insertedUser.email);
    });

    it('should return an error if user does not exist', async () => {
      const res = await request(app).get('/user/9999');

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });
  });

  describe('DELETE /user', () => {
    it('should delete a user', async () => {
      //prepare data
      const insertedUser = userBuilder.one();
      const [id] = await knex('users').insert(insertedUser);
      const res = await request(app).delete(`/user/${id}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'User deleted successfully');

      await assertDbMissing('users', {
        id: id,
      });
    });

    it('should return an error if user does not exist', async () => {
      const res = await request(app).delete('/user/9999');

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });
  });
});
