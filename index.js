const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

//hardcoded server db
let persons = [
    {
        id: 1,
        name: "Geoffrey Morrison",
        number: "045-623445"
    },
    {
        id:2,
        name: "Giorgios Hunter",
        number: "045-623446"
    },
    {
        id: 3,
        name: "Muumi Peikko",
        number: "010-526997"
    },
    {
        id: 4,
        name: "Nuuskis Muikkunen",
        number: "0100-100"
    },
]
//function that determines content for info page
const info = () => {
    const personCount = persons.length
    const currentDate = new Date()
    return(
        `
            <p>Phonebook has info for ${personCount} persons</p>
            <p>${currentDate}</p>
        `
    )
}
//enable cross origin requests
app.use(cors())
//initialize express
app.use(express.json())

app.use(express.static('dist'))

//create custom Morgan token for HTTP POST requests
morgan.token('post-data', (request, response) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ''
})
//initialize morgan
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))



/*function that generates a new random unique id for new person
function keeps generating an id for as long as the function doesn't
find already existing id */
const generateId = () => {
    let newId
    do {
        newId = Math.floor(Math.random() * 1000000)
    } while (persons.some(p => p.id === newId))

    return newId
}
//check if name exists in persons array. Returns a boolean
const nameExists = (nameToCheck) => {
    return persons.some(person => person.name === nameToCheck)
} 

//handle HTTP POST requests
app.post('/api/persons', (request, response) => {
    const body = request.body
    //if request body has no content, respond with error
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    if(nameExists(body.name)) {
        return response.status(400).json({
            error: 'Name already exists'
        })
    }
    //create a new person object with fresh generated id and concat
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    console.log(person)
    persons = persons.concat(person)

    response.json(person)
})


app.get('/', (request, response) => {
    response.send('<h1>Node express is cool Bro</h1>')
})

//handles requests for persons collection
app.get('/api/persons', (request, response) => {
    console.log("Request for persons data received")
    response.send(persons)
    console.log("persons: response sent")
})

//handle requests for a single resource (person)
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

//handle info page request
app.get('/info', (request, response) => {
    console.log("info page request received")
    response.send(info())
    console.log("info response sent")
})

//handle resource delete requests
app.delete('/api/persons/:id', (request, response) => {
    console.log(`delete: request for id ${request.params.id} received`)
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
    console.log(`delete: response sent. ID ${id} deleted`)
})
//determine port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})