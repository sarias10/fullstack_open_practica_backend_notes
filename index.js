// Las variables de entorno definidas en el archivo .env se pueden utilizar con esto

const express = require('express')
const app = express()
require('dotenv').config()

const cors = require('cors')

const Note = require('./models/note')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

// Orden de los middleware es importante
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)
app.use(cors())





  app.get('/', (request, response) =>{
    response.send('<h1>Hello im sergio World!</h1>')
  })

  app.get('/api/notes', (request, response) =>{
    Note.find({}).then(notes=>{
      response.json(notes)
    })
  })

  app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note=>{
      if(note){
        response.json(note)
      } else {
        // .end() se emplea para concluir rápidamente la respuesta sin incluir ningún dato.
        // 404 = no encontrado
        response.status(404).end()
      }
    })
    //Si se rechaza una promesa devuelta por el método findById
    .catch(error=> next(error)) // pasa el error a express(), el cual tiene su propio controlador de errores
  })

  app.delete('/api/notes/:id', (request, response) =>{
    Note.findByIdAndDelete(request.params.id)
    .then(result=>{ // el parametro "result" podría usarse para verificar si un recurso realmente se eliminó y podriamos usar esta informacion para devolver códigos de estado diferentes
      // 204 = sin contenido
      response.status(204).end()
    })
    .catch(error=>next(error))
  })

  app.post('/api/notes', (request, response) =>{
    const body = request.body

    if(!body.content){
      return response.status(400).json({
        error: 'content missing'
      })
    }

    const note = new Note({
      content: body.content,
      important: body.important || false,
    })

    note.save().then(savedNote => {
      response.json(savedNote)
    })
  })

  app.put('/api/notes/:id', (request, response, next)=>{
    const body = request.body

    const note = {
      content: body.content,
      important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, {new: true})
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
    
  })





  const unknownEndpoint = (request, response) => {
    response.status(404).send({
      error: 'unknown endpoint'
    })
  }
  
  // handler of requests with unknown endpoint
  app.use(unknownEndpoint)
  


  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    console.log(error.name)
    if(error.name==='CastError') {
      return response.status(400).send({error: 'malformatted id'})
  
    }
    next(error)
  }

  // handler of requests with result to errors
  app.use(errorHandler)
  


const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
