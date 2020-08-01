const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const Stat = require('../models/Stat');
const User = require('../models/User');

const connection = new Sequelize(dbConfig);

Stat.init(connection);
User.init(connection);

module.exports = connection;
