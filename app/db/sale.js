const { Model } = require('objection');
const db = require('./index');
Model.knex(db);

class Sale extends Model {
  static get tableName() {
    return 'sales';
  }

  static get relationMappings() {
    const User = require('./user');
    const Product = require('./product');
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'sales.user_id',
          to: 'users.id',
        },
      },
      products: {
        relation: Model.ManyToManyRelation,
        modelClass: Product,
        join: {
          from: 'sales.id',
          through: {
            from: 'sales_product.sale_id',
            to: 'sales_product.product_id',
            extra: ['quantity'],
          },
          to: 'products.id',
        },
      },
    };
  }
}

module.exports = Sale;
