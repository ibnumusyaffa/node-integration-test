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

  const users = [
    {
      email: 'admin@example.com',
      fullname: 'admin',
      role_id: 1,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  for (let i = 0; i < 100; i++) {
    users.push({
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      role_id: faker.helpers.arrayElement([1, 2]),
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  await knex('users').del();
  await knex('users').insert(users);
};