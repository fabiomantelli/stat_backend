const router = require('express').Router()

router.get('/api', (req, resp) => {
  resp.status(200).send({
    success: 'true',
    message: 'Welcome to Statistic API',
    version: '1.0.0'
  })
})

module.exports = router
