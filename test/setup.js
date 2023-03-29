const db = require('../app/database');
async function truncateTables() {
  try {
    await db.schema.raw('SET FOREIGN_KEY_CHECKS = 0');

    const tables = await db.raw('SHOW TABLES');
    const tableNames = tables[0]
      .map((table) => Object.values(table)[0])
      .filter((item) => !['migrations', 'migrations_lock'].includes(item));

    const truncatePromises = [];
    for (const tableName of tableNames) {
      truncatePromises.push(db(tableName).truncate());
    }

    await Promise.all(truncatePromises);
    await db.schema.raw('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
}

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
