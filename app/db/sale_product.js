const { Model } = require('objection');
const db = require('./index');
Model.knex(db);

class SaleProduct extends Model {
  static get tableName() {
    return 'sales_product';
  }

  static get relationMappings() {
    const Sale = require('./sale');
    const Product = require('./product');
    return {
      sale: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sale,
        join: {
          from: 'sales_product.sale_id',
          to: 'sales.id',
        },
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'sales_product.product_id',
          to: 'products.id',
        },
      },
    };
  }
}

module.exports = SaleProduct;
