/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.integer('role_id').unsigned().notNullable();
    table.foreign('role_id').references('id').inTable('roles');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('role_id')
  });
};
