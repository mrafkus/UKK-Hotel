'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pemesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'id_user', as: 'user'});
      
      this.belongsTo(models.customer, { foreignKey: 'id_customer', as: 'customer'});

      this.belongsTo(models.tipe_kamar, { foreignKey: 'id_tipe_kamar', as: 'tipe_kamar'});

      this.hasMany(models.detail_pemesanan, { foreignKey: 'id_pemesanan', as: 'detail_pemesanan'});
    }
  }
  pemesanan.init({
    id_pemesanan:{
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    nomor_pemesanan: DataTypes.INTEGER(10),
    id_customer: DataTypes.INTEGER(11),
    tgl_pemesanan: DataTypes.DATEONLY,
    tgl_check_in: DataTypes.DATEONLY,
    tgl_check_out: DataTypes.DATEONLY,
    jumlah_kamar: DataTypes.INTEGER(11),
    id_tipe_kamar: DataTypes.INTEGER(11),
    status_pemesanan: DataTypes.ENUM('Baru','Check-In','Check-Out'),
    id_user: DataTypes.INTEGER(11)
  }, {
    sequelize,
    modelName: 'pemesanan',
    tableName: 'pemesanan'
  });
  return pemesanan;
};