module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_pmu: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      pmu: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dados_recebidos: {
        type: Sequelize.DECIMAL(5, 4)
      },
      latencia_conforme: {
        type: Sequelize.DECIMAL(5, 4)
      },
      latencia_minima: {
        type: Sequelize.INTEGER
      },
      latencia_media: {
        type: Sequelize.INTEGER
      },
      latencia_maxima: {
        type: Sequelize.INTEGER
      },
      dados_adequados: {
        type: Sequelize.DECIMAL(5, 4)
      },
      configuracao: {
        type: Sequelize.DECIMAL(5, 4)
      },
      pmu_time_quality: {
        type: Sequelize.DECIMAL(5, 4)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stats')
  }
}
