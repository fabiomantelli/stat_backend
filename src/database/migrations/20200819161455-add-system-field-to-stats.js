'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'stats',
      'system',
      {
        type: Sequelize.DataTypes.STRING
      }
    )
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'stats',
      'system'
    )
  }
}
