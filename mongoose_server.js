const express = require('express') 
const logger = require('morgan')
const bodyParser = require('body-parser')
const errorhandler = require('errorhandler')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/bank-accounts', { useNewUrlParser: true })

let app = express()
app.use(logger('dev'))
app.use(bodyParser.json())

// define the model to use for every method
const Account = mongoose.model('Account', {
  name: String,
  balance: Number
})


// GET method (send back all the accounts)
app.get('/accounts', (req, res, next) => {
  Account.find({}, null, {sort: {_id: -1}}, (error, accounts) => {
    if (error) return next(error)
    res.send(accounts)
  })
})

// app.param is a middleware that allows us to use the findById function every
// time 'id' is called in the request
app.param('id', (req, res, next) => {
  Account.findAccount(req.params.id, (error, account) => {
    req.account = account
    next()
  })
})

// GET method for a specific id (using the app.param middleware for IDs
app.get('/accounts/:id', (req, res, next) => {
    res.send(req.account.toJSON())
})

// POST a new account. The key types are defined by the Account model
// defined in the very beginning
app.post('/accounts', (req, res, next) => {
  let newAccount = new Account(req.body)
  newAccount.save((error, results) => {
    if (error) return next(error)
    res.send(results)
  })
})

// PUT method for a specific id (using the app.param middleware for IDs.
// The key types are defined by the Account model defined in the very beginning
app.put('/accounts/:id', (req, res, next) => {
  if (req.body.name) req.account.name = req.body.name
  if (req.body.balance) req.account.balance = req.body.balance
  req.account.save((error, results) => {
    res.send(results)
  })
})

// DELETE a specific account, based on the id parameter (it still uses the middleware)
app.delete('/accounts/:id', (req, res, next) => {
  req.account.remove((error, results) => {
    if (error) return next(error)
    res.send(results)
  })
})

app.use(errorhandler())

app.listen(3000)
