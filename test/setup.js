const db = require('../app/database');
const { truncateTables } = require('./util/db');

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(1000 * 5);
    await db.migrate.latest();
    await db.seed.run();
  },
  async afterAll() {
    this.timeout(1000 * 5);
    await truncateTables();
    // await db.migrate.rollback();
  },
};
