require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

//setup errorHandler
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if(error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    next(error)
}

//enable cross origin requests
app.use(cors())
//initialize express
app.use(express.json())
app.use(express.static('build'))
//create custom Morgan token for HTTP POST requests
morgan.token('post-data', (request, response) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ''
})
//initialize morgan
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

//Handle HTTP GET requests
app.get('/api/persons', (request, response) => {
    console.log('Request for persons data received from browser')
    Person.find({}).then(persons => {
        response.json(persons)
    })
    console.log('persons: response sent from server')
})

//handle HTTP POST requests
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    //if request body has no content, respond with error
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    //instance of Person model and assign it to a constant newPerson
    const newPerson = new Person({
        name: body.name,
        number: body.number
    })
    //save newPerson to database and console.log
    newPerson.save().then(savedPerson => {
        console.log(savedPerson)
        response.json(savedPerson)
    })
        .catch(error => next(error))
})

//handle requests for a single resource (person)
//Use Person.findById method to fetch person data from Mongo if matching id is found
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//HTTP PUT request handler
//need to update front-end?
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

//initialize error handler
app.use(errorHandler)

//handle info page request
app.get('/info', (request, response) => {
    Person.countDocuments({}).then(count => {
        const currentDate = new Date()
        response.send(`
            <p>Phonebook has info for ${count} persons</p>
            <p>${currentDate}</p>
        `)
    })
})

//handle HTTP DELETE requests
app.delete('/api/persons/:id', (request, response, next) => {
    console.log(`delete: request for id ${request.params.id} received`)
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

//determine port
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})