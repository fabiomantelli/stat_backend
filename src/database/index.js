const Sequelize = require('sequelize')
const dbConfig = require('../config/database.js')
const User = require('../models/User.js')
const Stat = require('../models/Stat.js')

const connection = new Sequelize(dbConfig)

Stat.init(connection)
User.init(connection)

module.exports = connection
