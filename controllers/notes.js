const notesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

notesRouter.get('/', async (request, response) => {
    const notes = await Note
        .find({}).populate('user', { username: 1, name: 1 })

    response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if(note){
        response.json(note)
    }
    else {
        // .end() se emplea para concluir rápidamente la respuesta sin incluir ningún dato.
        // 404 = no encontrado
        response.status(404).end()
    }
})

notesRouter.post('/', async (request, response) => {
    const body = request.body

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if(!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false: body.important,
        user: user._id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    //un código 201 significa que una solicitud se procesó correctamente y devolvió,o creó, un recurso o resources en el proceso
    response.status(201).json({
        content: savedNote.content,
        important: savedNote.important,
        user: { name: user.name },
        id: savedNote.id,
    })
})

notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndDelete(request.params.id)
    // 204 = sin contenido
    response.status(204).end()
})

notesRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important
    }

    try {
        const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, {
            new: true,
            runValidators: true,
            context: 'query'
        })

        const user = await User.findById(updatedNote.user, 'name')
        if (!user) {
            return response.status(404).json({ error: 'user not found' })
        }
        response.json({
            content: updatedNote.content,
            important: updatedNote.important,
            user: { name: user.name },
            id: updatedNote.id,
        })
    } catch (error) {
        next(error)
    }
})

module.exports = notesRouter