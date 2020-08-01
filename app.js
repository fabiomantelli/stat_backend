const express = require('express')
const cors = require('cors')

require('./src/database')

const cron = require('node-cron')
const statController = require('./src/controller/stat.controller')

const app = express()

// API routes
const index = require('./src/routes/index')
const statRoute = require('./src/routes/stat.routes')
const loginRoute = require('./src/routes/login.routes')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use(index)
app.use('/api/', statRoute)
app.use('/login/', loginRoute)

cron.schedule('50 23 * * * ', () => {
  const date = new Date()
  const day = date.getDate() - 1
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const req = {
    body: {
      date: `${month}-${day}-${year}`
    }
  }

  statController.createStat(req)
})

module.exports = app
