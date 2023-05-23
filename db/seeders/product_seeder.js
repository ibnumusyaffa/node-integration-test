/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { faker } = require('@faker-js/faker');

exports.seed = async function (knex) {
  // Deletes ALL existing entries

  const products = [];

  for (let i = 0; i < 100; i++) {
    products.push({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: faker.commerce.price(),
      stock: faker.random.numeric(),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  await knex('products').insert(products);
};
