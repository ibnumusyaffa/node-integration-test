const db = require('../app/db');
const { dropAllTables, truncateAllTables } = require('./util/db');

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(1000 * 5);
    await db.migrate.latest();
    await db.seed.run();
  },
  async afterAll() {
    this.timeout(1000 * 5);
    await truncateAllTables();
    // await dropAllTables();
    // await db.migrate.rollback();
    
    // disconnect database
    await db.destroy();
  },
};
