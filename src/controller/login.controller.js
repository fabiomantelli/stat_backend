const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const utils = require('./utils')
const User = require('../models/User')

// const userData = {
//   userId: 'fabiomantelli',
//   password: 'medfasee',
//   name: 'Fábio Mantelli',
//   username: 'fabiomantelli',
//   isAdmin: true,
// };

// check user
exports.checkUser = (req, res, next) => {
  // check header or url parameters or post parameters for token
  let token = req.headers.authorization

  if (!token) return next() // if no token, continue

  token = token.replace('Bearer ', '')
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: 'Invalid user.'
      })
    }
    req.user = user // set the user to req so other routes can use it
    next()
  })
}

// request handlers
exports.handlers = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid user to access it.'
    })
  }
  res.send(`Welcome to login! - ${req.user.name}`)
}

exports.signIn = async (req, res) => {
  const user = req.body.username
  const pwd = req.body.password
  console.log(`user and pwd: ${user} and ${pwd}`)

  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: 'Username or Password required.'
    })
  }

  const users = await User.findAll({
    where: {
      username: user
    }
  })

  if (users.length > 0 && users !== undefined) {
    let match = true
    console.log(`users length: ${users.length}`)
    passwordDB = users[0].password
    match = await bcrypt.compare(pwd, passwordDB)

    // return 401 status if the credential is not match.
    if (!match) {
      return res.status(401).json({
        error: true,
        message: 'Password is Wrong.'
      })
    }
    const userData = {
      username: user,
      password: passwordDB
    }

    // generate token
    const token = utils.generateToken(userData)
    // get basic user details
    const userObj = utils.getCleanUser(userData)
    // return the token along with user details
    return res.json({ user: userObj, token })
  }
  return res.status(400).json({
    error: true,
    message: 'Invalid User or password'
  })
}

exports.verifyToken = (req, res) => {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token
  if (!token) {
    return res.status(400).json({
      error: true,
      message: 'Token is required.'
    })
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token.'
      })
    }

    // return 401 status if the userId does not match.
    if (user.userId !== userData.userId) {
      return res.status(401).json({
        error: true,
        message: 'Invalid user.'
      })
    }
    // get basic user details
    const userObj = utils.getCleanUser(userData)
    return res.json({ user: userObj, token })
  })
}

exports.signUp = async (req, res) => {
  const {
    name, username, password, password2, email
  } = req.body

  console.log({
    name,
    username,
    password,
    password2,
    email
  })

  function hashPassword (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
  }

  const hashedPassword = hashPassword(password)

  console.log(`hash: ${hashedPassword}`)

  const user = await User.create({
    name,
    username,
    password: hashedPassword,
    email
  })

  return res.status(200).json(user)
}
