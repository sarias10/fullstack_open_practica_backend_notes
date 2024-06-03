const notesRouter = require('express').Router()
const Note = require('../models/note')


notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({})
    response.json(notes)
})

notesRouter.get('/:id', async (request, response, next) => {
    try {
        const note = await Note.findById(request.params.id)
        if(note){
            response.json(note)
        }
        else {
            // .end() se emplea para concluir rápidamente la respuesta sin incluir ningún dato.
            // 404 = no encontrado
            response.status(404).end()
        }
    } catch (exception) {
        //Si se rechaza una promesa devuelta por el método findById
        // pasa el error a express(), el cual tiene su propio controlador de errores
        next(exception)
    }
})

notesRouter.post('/', async (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })
    try {
        const savedNote = await note.save()
        //un código 201 significa que una solicitud se procesó correctamente y devolvió,o creó, un recurso o resources en el proceso
        response.status(201).json(savedNote)
    } catch(exception){
        next(exception)
    }
})

notesRouter.delete('/:id', async (request, response,next) => {
    try {
        await Note.findByIdAndDelete(request.params.id)
        // 204 = sin contenido
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
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