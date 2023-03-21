'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kamar.belongsTo(models.tipe_kamar, { foreignKey: 'id_tipe_kamar', as: 'tipe_kamar'});

      kamar.hasMany(models.detail_pemesanan, { foreignKey: 'id_kamar', as: 'detail_pemesanan'});
    }
  }
  kamar.init({
    id_kamar: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    nomor_kamar: DataTypes.INTEGER(11),
    id_tipe_kamar: DataTypes.INTEGER(11)
  }, {
    sequelize,
    modelName: 'kamar',
    tableName: 'kamar'
  });
  return kamar;
};