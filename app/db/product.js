const { Model } = require('objection');
const db = require('./index');
Model.knex(db);

class Product extends Model {
  static get tableName() {
    return 'products';
  }
}

module.exports = Product;
