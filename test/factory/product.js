const { faker } = require('@faker-js/faker');
const { build, perBuild } = require('@jackfranklin/test-data-bot');

const productBuilder = build({
  fields: {
    name: perBuild(() => faker.commerce.productName()),
    description: perBuild(() => faker.commerce.productDescription()),
    price: perBuild(() => faker.commerce.price()),
    stock: perBuild(() => faker.random.numeric(2)),

    created_at: new Date(),
    updated_at: new Date(),
  },
});

module.exports = productBuilder;
