const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const lengthValidator = {
  validator: (number) => {
    console.log('validating length')
    return number.length >= 8
  },
  message: props => 'should have length of 8 or more'
}

const formatValidator =  {
  validator: (number) => {
    console.log('validating format')
    return /\d{2,3}[-—]$\d+/.test(number)
  },
  message: props => 'format is not followed'
}

const personSchema = new mongoose.Schema({
  name: { type: String, minLength: 3 },
  number: {
    type: String,
    validate: [lengthValidator, formatValidator]
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)