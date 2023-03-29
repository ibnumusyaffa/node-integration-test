const knex = require('../../app/database');
async function truncateTables() {
  try {
    await knex.schema.raw('SET FOREIGN_KEY_CHECKS = 0');

    const tables = await knex.raw('SHOW TABLES');
    const tableNames = tables[0]
      .map((table) => Object.values(table)[0])
      .filter((item) => !['migrations', 'migrations_lock'].includes(item));

    const truncatePromises = [];
    for (const tableName of tableNames) {
      truncatePromises.push(knex(tableName).truncate());
    }

    await Promise.all(truncatePromises);
    await knex.schema.raw('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
}

async function assertDatabaseHas(table, columnValues) {
  // check if the row exists using count() and where()
  const rowCount = await knex(table).count('*').where(columnValues);

  // assert that the row exists
  assert(
    rowCount[0]['count(*)'] > 0,
    `Failed asserting that ${table} table has row with ${JSON.stringify(
      columnValues
    )}`
  );
}

async function assertDatabaseMissing(table, columnValues) {
  // check if the row exists using count() and where()
  const rowCount = await knex(table).count('*').where(columnValues);

  // assert that the row does not exist
  assert(
    rowCount[0]['count(*)'] === 0,
    `Failed asserting that ${table} table does not have row with ${JSON.stringify(
      columnValues
    )}`
  );
}

module.exports = {
  truncateTables,
};
