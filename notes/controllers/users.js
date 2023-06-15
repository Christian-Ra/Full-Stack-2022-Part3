const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

//? Document databases do not properly support join queries between collections,
//? but the mongoose library can do some of these joins for us.
//? mongoose accomplises the join by doing multiple queries,
//? which is different from join queries in relational databases which are transactional,
//? meaning that the state of the database does not change during the time that the query is made.
//? with join queries in Mongoose, nothing can gurantee that the state between the collections
//? is consistent, meaning that if we make a query that joins the user and notes collections,
//? the state of the collections may change during the query.

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    important: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10 //2^rounds of hash iterations to hash password
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter
