const notesRouter = require('express').Router()
const Note = require('../models/note')


notesRouter.get('/', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if(note){
                response.json(note)
            }
            else {
                // .end() se emplea para concluir rápidamente la respuesta sin incluir ningún dato.
                // 404 = no encontrado
                response.status(404).end()
            }
        })
        //Si se rechaza una promesa devuelta por el método findById
        .catch(error => next(error)) // pasa el error a express(), el cual tiene su propio controlador de errores
})

notesRouter.post('/', (request, response, next) => {
    const body = request.body

    // Si la nota no tiene la propiedad content, respondemos a la solicitud con el código de estado 400 bad request.
    if(body.content===undefined){
        return response.status(400).json({ error: 'content missing' })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
})

notesRouter.delete('/:id', (request, response,next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(() => { // el parametro "result" podría usarse para verificar si un recurso realmente se eliminó y podriamos usar esta informacion para devolver códigos de estado diferentes
            // 204 = sin contenido
            response.status(204).end()
        })
        .catch(error => next(error))
})



notesRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(request.params.id,note,
        { new: true, runValidators:true, context: 'query' })
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter