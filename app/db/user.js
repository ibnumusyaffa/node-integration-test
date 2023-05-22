const { Model } = require('objection');
const db = require('./index');
Model.knex(db);

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    const Role = require('./role');
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: 'users.role_id',
          to: 'roles.id',
        },
      },
    };
  }
}

module.exports = User;
