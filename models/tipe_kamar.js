'use strict';
const {
  Model
} = require('sequelize');
const kamar = require('./kamar');
module.exports = (sequelize, DataTypes) => {
  class tipe_kamar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tipe_kamar.hasMany(models.kamar, { foreignKey: 'id_tipe_kamar', as: 'kamar'});

      tipe_kamar.hasMany(models.pemesanan, { foreignKey: 'id_tipe_kamar', as: 'pemesanan'});
    }
  }
  tipe_kamar.init({
    id_tipe_kamar: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    nama_tipe_kamar: DataTypes.STRING(100),
    harga: DataTypes.INTEGER(11),
    deskripsi: DataTypes.TEXT,
    foto: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'tipe_kamar',
    tableName: 'tipe_kamar'
  });
  return tipe_kamar;
};