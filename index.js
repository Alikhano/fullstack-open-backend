require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms  :body'))
app.use(cors())

const Person = require('./models/person')

app.get('/api/persons', ((req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  }).catch(error => next(error))
}))

app.get('/api/info', ((req, res, next) => {
  Person.countDocuments({}).then(count => {
    res.send(`<p>Phonebook has info for ${count} people</p> <p>${new Date()}</p>`)
  }).catch(error => next(error))
}))

app.get('/api/persons/:id', ((req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
}))

app.delete('/api/persons/:id', ((req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(result => {
    res.status(204).end()
  }).catch(error => next(error))
}))

app.post('/api/persons', ((req, res, next) => {
  const body = req.body

  // if (!body.name || !body.number) {
  //     return res.status(400).json({error: 'name and/or number are missing'})
  // }

  /*  Person.find({name: body.name}).then(result => {
        if (result) {
            return res.status(400).json({error: 'name must be unique', id: result.id})
        }
    })*/
  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save().then(savedPerson => {
    res.json(savedPerson)
  }).catch(error => next(error))
}))

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  const opts = { runValidators: true, new: true }
  Person.findByIdAndUpdate(req.params.id, person, opts).then(updatedPerson => {
    res.json(updatedPerson)
  }).catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
