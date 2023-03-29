const request = require('supertest');
const app = require('../../app/app');
const assert = require('chai').assert;

describe('GET /users', () => {
  it('returns a list of users', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/);

    assert.isArray(response.body.data, 'data is an array');
    assert.isNumber(response.body.total, 'total is a number');
    assert.isNumber(response.body.limit, 'limit is a number');
    assert.isNumber(response.body.currentPage, 'currentPage is a number');
    assert.isNumber(response.body.totalPages, 'totalPages is a number');
  });

  it('returns a filtered list of users with keyword parameter', async () => {
    const response = await request(app)
      .get('/?keyword=example')
      .expect(200)
      .expect('Content-Type', /json/);

    assert.isArray(response.body.data, 'data is an array');
    assert.isNumber(response.body.total, 'total is a number');
    assert.isNumber(response.body.limit, 'limit is a number');
    assert.isNumber(response.body.currentPage, 'currentPage is a number');
    assert.isNumber(response.body.totalPages, 'totalPages is a number');
  });
});