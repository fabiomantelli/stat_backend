const { Model, DataTypes } = require('sequelize');

class Stat extends Model {
  static init(sequelize) {
    super.init({
      id_pmu: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      pmu: DataTypes.STRING,
      dados_recebidos: DataTypes.DECIMAL(5, 4),
      latencia_conforme: DataTypes.DECIMAL(5, 4),
      latencia_minima: DataTypes.INTEGER,
      latencia_media: DataTypes.INTEGER,
      latencia_maxima: DataTypes.INTEGER,
      dados_adequados: DataTypes.DECIMAL(5, 4),
      configuracao: DataTypes.DECIMAL(5, 4),
      pmu_time_quality: DataTypes.DECIMAL(5, 4),

    }, {
      sequelize,
    });
  }
}

module.exports = Stat;
