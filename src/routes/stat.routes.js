const express = require('express')
const router = express()
const statController = require('../controller/stat.controller')

// Definindo as rotas do CRUD - 'Statistic'

// Route to create a new stat: (POST): localhost:3003/api/statistic
router.post('/stat', statController.createStat)

// Route to list all stat: (GET): localhost:3003/api/stat
router.get('/stat', statController.listAllStat)

// Route to delete stat per date: (DELETE): localhost:3003/api/stat/:date
router.delete('/stat/:date', statController.deleteStat)

module.exports = router
