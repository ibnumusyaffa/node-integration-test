const knex = require('../../app/db');
const assert = require('chai').assert;
async function truncateAllTables() {
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

async function dropAllTables() {
  try {
    await knex.schema.raw('SET FOREIGN_KEY_CHECKS = 0');

    const tables = await knex.raw('SHOW TABLES');
    const tableNames = tables[0].map((table) => Object.values(table)[0]);

    const truncatePromises = [];
    for (const tableName of tableNames) {
      truncatePromises.push(knex.schema.dropTableIfExists(tableName));
    }

    await Promise.all(truncatePromises);
    await knex.schema.raw('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
}

async function assertDbHas(table, columnValues) {
  // check if the row exists using count() and where()
  const rowCount = await knex(table).count('* as count').where(columnValues);
  // assert that the row exists
  assert.equal(
    rowCount[0].count > 0,
    true,
    `Failed : ${table} table does not have row with ${JSON.stringify(
      columnValues
    )}`
  );
}

async function assertDbHasOne(table, columnValues) {
  // check if the row exists using count() and where()
  const rowCount = await knex(table).count('* as count').where(columnValues);

  // assert that the row exists
  assert.equal(
    rowCount[0].count,
    1,
    `Failed : ${table} table does not have 1 row with ${JSON.stringify(
      columnValues
    )}`
  );
}

async function assertDbMissing(table, columnValues) {
  // check if the row exists using count() and where()
  const rowCount = await knex(table).count('* as count').where(columnValues);

  assert.equal(
    rowCount[0].count,
    0,
    `Failed : ${table} table does have row with ${JSON.stringify(columnValues)}`
  );
}

module.exports = {
  truncateAllTables,
  dropAllTables,
  assertDbHas,
  assertDbHasOne,
  assertDbMissing,
};
