const request = require('supertest');
const app = require('../../app/app');
const expect = require('chai').expect;
const knex = require('../../app/db');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const { createToken } = require('../util/auth');

const user = {
  email: faker.internet.email(),
  fullname: faker.name.fullName(),
  password: '',
  role_id: 1,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Auth', () => {
  before(async () => {
    // create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await knex('users').insert({
      email: user.email,
      role_id: 1,
      password: hashedPassword,
      fullname: user.fullname,
    });
  });

  after(async () => {
    await knex('users').where({ email: user.email }).del();
  });

  describe('POST /login', () => {
    it('returns a JWT token on successful login', async () => {
      const response = await request(app).post('/login').send({
        email: user.email,
        password: 'testpassword',
      });
      expect(response.body).to.have.property('token');
    });

    it('returns an error for invalid email', async () => {
      const response = await request(app).post('/login').send({
        email: 'invalidemail@example.com',
        password: 'testpassword',
      });
      expect(response.statusCode).to.equal(401);
      expect(response.body.error).to.be.a('string')
    });

    it('returns an error for invalid password', async () => {
      const response = await request(app).post('/login').send({
        email: user.email,
        password: 'invalidpassword',
      });
      expect(response.statusCode).to.equal(401);
      expect(response.body.error).to.be.a('string')
    });
  });

  describe('GET /profile', () => {
    it('check profile', async () => {
      const res = await request(app)
        .get('/profile')
        .auth(createToken(user.email), {
          type: 'bearer',
        });

      expect(res.body.user.email).to.equal(user.email);
    });
  });
});
