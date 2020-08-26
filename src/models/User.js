const Sequelize = require('sequelize')
const { Model, DataTypes } = Sequelize

class User extends Model {
  static init (sequelize) {
    super.init({
      name: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING
    }, {
      sequelize
    })
  }
}

module.exports = User
