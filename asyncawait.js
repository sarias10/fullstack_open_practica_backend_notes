//codigo de prueba
require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.TEST_MONGODB_URI

mongoose.connect(url).then(
    console.log('connected to mongo')
)
const Note = require('./models/note')
const notesInDb = require('./tests/test_helper').notesInDb

const main = async () => {
    const notes = await Note.find({})
    console.log('operation returned the following notes', notes)
    const response = await notes[0].deleteOne()
    console.log('the first note is removed')
}


const main2 = async () => {
    console.log( await notesInDb())
    mongoose.connection.close()
}

const main3 = async () => {
    const notes = await Note.find({})
    console.log('operation returned the following notes', notes)
}

main2()



