/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sales_product', function (table) {
    table.increments('id');
    table.integer('sale_id').unsigned().references('id').inTable('sales');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('quantity').defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sales_product');
};
