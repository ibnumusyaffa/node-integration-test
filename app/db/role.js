const { Model } = require('objection');
const db = require('./index');
Model.knex(db);

class Role extends Model {
  static get tableName() {
    return 'roles';
  }
}

module.exports = Role;
