const { test, after, describe, beforeEach } = require('node:test')
const bcrypt = require('bcrypt')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Note = require('../models/note')
const User = require('../models/user')



describe('when there is initially some notes saved', () => {
    //la base de datos se borra al principio y luego guardamos las notas almacenadas en la matriz initialNotes
    beforeEach(async () => {
        await Note.deleteMany({})
        // de esta forma se garantiza un orden de ejecución específico
        for (let note of helper.initialNotes) {
            let noteObject = new Note(note)
            await noteObject.save()
        }
    })

    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')

        assert.strictEqual(response.body.length, helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(r => r.content)
        assert(contents.includes('Browser can execute only javascript'))
    })

    describe('viewing a specific note', () => {
        test('succeeds with a valid id', async () => {
            const notesAtStart = await helper.notesInDb()

            const noteToView = notesAtStart[0]

            const resultNote = await api
                .get(`/api/notes/${noteToView.id}`)
                // el código de estado 200 OK se utiliza para indicar que se recibió y se procesó una solicitud correctamente.
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.deepStrictEqual(resultNote.body, noteToView)
        })

        test('fails with statuscode 404 if note does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId()

            await api
                .get(`/api/notes/${validNonexistingId}`)
                .expect(404)
        })

        test('fails with statuscode 400 id is invalid', async () => {
            const invalidId = '5a3d5da59070081a82a3445'

            await api
                .get(`/api/notes/${invalidId}`)
                .expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('succeeds with valid data', async () => {
            const newNote = {
                content: 'async/await simplifies making async calls',
                important: true,
            }

            await api
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect('Content-type', /application\/json/)

            const notesAtEnd = await helper.notesInDb()
            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length+1)

            const contents = notesAtEnd.map(n => n.content)
            assert(contents.includes('async/await simplifies making async calls'))
        })

        test('fails with status code 400 if data invalid', async () => {
            const newNote = {
                important: true
            }

            await api
                .post('/api/notes')
                .send(newNote)
                .expect(400)

            const notesAtEnd = await helper.notesInDb()

            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
        })
    })

    describe('deletion of a note', () => {
        test('a note can be deleted', async () => {
            const notesAtStart = await helper.notesInDb()
            const noteToDelete = notesAtStart[0]

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                // el código 204 significa que la petición se ha completado con éxito pero su respuesta no tiene ningún contenido, aunque los encabezados pueden ser útiles.
                .expect(204)

            const notesAtEnd = await helper.notesInDb()

            assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)

            const contents = notesAtEnd.map(r => r.content)
            assert(!contents.includes(noteToDelete.content))

        })
    })
})


// aqui comienza las pruebas de la creación de usuarios

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const userAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukai',
            name: 'Matti Luukainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, userAtStart.length +1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const userAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length,userAtStart.length)
    })
})



after(async () => {
    await mongoose.connection.close()
})