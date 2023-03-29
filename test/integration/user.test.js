const assert = require('assert');
const request = require('supertest');
const app = require('../../app/app');

describe('GET /users', () => {
  it('returns a list of users', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /json/);

    assert.ok(Array.isArray(response.body.data), 'data is an array');
    assert(typeof response.body.total === 'number', 'total is a number');
    assert(typeof response.body.limit === 'number', 'limit is a number');
    assert(
      typeof response.body.currentPage === 'number',
      'currentPage is a number'
    );
    assert(
      typeof response.body.totalPages === 'number',
      'totalPages is a number'
    );
  });

  it('returns a filtered list of users with keyword parameter', async () => {
    const response = await request(app)
      .get('/?keyword=example')
      .expect(200)
      .expect('Content-Type', /json/);

    assert.ok(Array.isArray(response.body.data), 'data is an array');
    assert(typeof response.body.total === 'number', 'total is a number');
    assert(typeof response.body.limit === 'number', 'limit is a number');
    assert(
      typeof response.body.currentPage === 'number',
      'currentPage is a number'
    );
    assert(
      typeof response.body.totalPages === 'number',
      'totalPages is a number'
    );
  });
});
