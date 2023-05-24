/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// const { faker } = require('@faker-js/faker');
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
    {
      email: 'customer@example.com',
      fullname: 'customer',
      role_id: 2,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await knex('users').insert(users);
};
