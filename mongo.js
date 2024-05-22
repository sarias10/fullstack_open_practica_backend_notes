const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://first_mongo_database:${password}@cluster0.hbnnnz3.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'Saludos',
  important: true,
})

// Guarda notas en la base de datos

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

// Encuentra todas las notas de la base de datos y las muestra en consola
// El parámetro del método es un objeto que expresa las condiciones de búsqueda.
// Dado que el parámetro es un objeto vacío {}, obtenemos todas las notas almacenadas
// en la colección de notas .
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})