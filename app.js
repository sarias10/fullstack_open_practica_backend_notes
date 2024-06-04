const config = require('./utils/config')
const express = require('express')
//nos permite eliminar los bloques try/catch por completo en funciones async
//es decir, pasa automáticamente las excepciones al middleware del manejo de errores
//se debe importar antes de importar las rutas
require('express-async-errors')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch(error => {
        logger.error('error connecting to MongoDB:', error.message)
    })

// Orden de los middleware es importante
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes',notesRouter)

// handler of requests with unknown endpoint
app.use(middleware.unknownEndpoint)
// handler of requests with result to errors
app.use(middleware.errorHandler)

module.exports = app