const mongoose = require('mongoose')
//url
const url = process.env.MONGODB_URI
const phoneRegex = /^(\d{3}-\d{8})$/
//schema for Person
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: function(v) {
                return phoneRegex.test(v)
            },
            message: props => `${props.value} is not a valid phone number`
        }
    },
})

//convert database data to json format + fix id's
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

mongoose.set('strictQuery', false)
//making connection request and waiting for it to be established before proceeding
console.log('connecting to: mongo phonebook db')
mongoose.connect(url)
    .then(() => {
        console.log('MongoDB connection established')
    })
    .catch(error => {
        console.log(error)
    })

module.exports = mongoose.model('Person', personSchema)