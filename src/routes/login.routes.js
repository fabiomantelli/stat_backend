// middleware that checks if JWT token exists and verifies it if it does exist.
// In all future routes, this helps to know if the request is authenticated or not.

const express = require('express')

const app = express()

const loginController = require('../controller/login.controller')

// check user
app.use(loginController.checkUser)

// request handlers
app.get('/', loginController.handlers)

// validate the user credentials
app.post('/signIn', loginController.signIn)

// verify the token and return it if it's valid
app.get('/verifyToken', loginController.verifyToken)

// validate the user credentials
app.post('/signUp', loginController.signUp)

module.exports = app
