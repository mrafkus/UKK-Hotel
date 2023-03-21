'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pemesanan, { foreignKey: 'id_customer', as: 'pemesanan'});
    }
  }
  customer.init({
    id_customer: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING(100),
    username: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    password: DataTypes.TEXT,
    foto: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'customer',
    tableName: 'customer'
  });
  return customer;
};