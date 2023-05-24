const { faker } = require('@faker-js/faker');
const { build, perBuild } = require('@jackfranklin/test-data-bot');

const userBuilder = build({
  fields: {
    email: perBuild(() => faker.internet.email()),
    fullname: perBuild(() => faker.name.fullName()),
    role_id: 1,
    password: "-",
    created_at: new Date(),
    updated_at: new Date(),
  },
  traits: {
    customer: {
      overrides: { role_id: 2 },
    },
  },
});


module.exports = userBuilder;
