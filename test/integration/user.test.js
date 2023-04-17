const request = require('supertest');
const app = require('../../app/app');
const assert = require('chai').assert;
const knex = require('../../app/database');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

describe('GET /user', () => {
  it('returns a list of users', async () => {
    const res = await request(app).get('/user');
    assert.isArray(res.body.data, 'data is an array');
    assert.isNumber(res.body.total, 'total is a number');
    assert.isNumber(res.body.limit, 'limit is a number');
    assert.isNumber(res.body.currentPage, 'currentPage is a number');
    assert.isNumber(res.body.totalPages, 'totalPages is a number');

    const userCount = await knex('users').count('* as count').first();

    assert.equal(res.body.total, userCount.count, 'total is correct');
  });

  it('returns a filtered list of users with email paramater', async () => {
    //prepare data
    const insertedUser = {
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
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
  });
});

describe('POST /user', () => {
  it('should create a new user', async () => {
    //prepare data
    const body = {
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      password: 'password123',
    };

    const res = await request(app).post('/user').send(body);

    assert.equal(res.statusCode, 200);
    const salt = await bcrypt.genSalt(10);
    const insertedUser = await knex('users')
      .where({
        email: body.email,
      })
      .first();
    assert.equal(body.email, insertedUser.email, 'data is inserted');
    assert.equal(body.fullname, insertedUser.fullname, 'data is inserted');
  });

  it('should return an error if email is already in use', async () => {
    //prepare data
    const insertedUser = {
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      password: '',
      created_at: new Date(),
      updated_at: new Date(),
    };
    await knex('users').insert(insertedUser);

    const res = await request(app).post('/user').send({
      email: insertedUser.email,
      fullname: 'Test User',
      password: 'password123',
    });
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.errors.email, 'Email already in use');
  });
});

describe('DELETE /user', () => {
  it('should delete a user', async () => {
    //prepare data
    const insertedUser = {
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      password: '',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const id = await knex('users').insert(insertedUser);
    const res = await request(app).delete(`/user/${id[0]}`);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'User deleted successfully');
    const deletedUser = await knex('users')
      .where({
        id: id[0],
      })
      .first();
    assert.equal(undefined, deletedUser, 'User is deleted');
  });

  it('should return an error if user does not exist', async () => {
    const res = await request(app).delete('/user/9999');
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'User not found');
  });
});
