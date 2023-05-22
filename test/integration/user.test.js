const request = require('supertest');
const app = require('../../app/app');
const assert = require('chai').assert;
const knex = require('../../app/db');
const { faker } = require('@faker-js/faker');
const { expectDatabaseHasOne, expectDatabaseMissing } = require('../util/db');

describe('CRUD user', () => {
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
      const insertedUser = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        role_id: 1,
        password: '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await knex('users').insert(insertedUser);
      const res = await request(app)
        .get('/user')
        .query({ email: insertedUser.email });

      assert.equal(
        res.body.data[0].email,
        insertedUser.email,
        'email is correct'
      );
      assert.equal(res.body.meta.total, 1, 'total is correct');
    });
  });

  describe('POST /user', () => {
    it('should create a new user with valid data', async () => {
      //prepare data
      const body = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        role_id: 1,
        password: 'password123',
      };

      //send data
      const res = await request(app).post('/user').send(body);

      //check if status code is 200
      assert.equal(res.statusCode, 200);

      await expectDatabaseHasOne('users', {
        email: body.email,
        role_id: 1,
        fullname: body.fullname,
      });
    });

    it('should return an error if email is already in use', async () => {
      //prepare data
      const insertedUser = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        password: '',
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await knex('users').insert(insertedUser);

      // send data
      const res = await request(app).post('/user').send({
        email: insertedUser.email,
        role_id: 1,
        fullname: 'Test User',
        password: 'password123',
      });

      //expected response
      assert.equal(res.statusCode, 422);
      assert.equal(res.body.errors.email, 'Email already in use');
    });
  });

  describe('GET /user/:id', () => {
    it('should return user with given id', async () => {
      //prepare data
      const insertedUser = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        password: '',
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const id = await knex('users').insert(insertedUser);
      const res = await request(app).get(`/user/${id[0]}`);

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
      const insertedUser = {
        email: faker.internet.email(),
        fullname: faker.name.fullName(),
        password: '',
        role_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const id = await knex('users').insert(insertedUser);
      const res = await request(app).delete(`/user/${id[0]}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'User deleted successfully');

      await expectDatabaseMissing('users', {
        id: id[0],
      });
    });

    it('should return an error if user does not exist', async () => {
      const res = await request(app).delete('/user/9999');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });
  });
});
