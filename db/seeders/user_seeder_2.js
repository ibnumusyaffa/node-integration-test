/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const users = [];
  for (let id = 1; id <= 100; id++) {
    users.push({
      email: faker.internet.email().toLowerCase(),
      fullname: faker.name.fullName(),
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }


  await knex('users').insert(users);
};
