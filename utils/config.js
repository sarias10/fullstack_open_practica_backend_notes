// Las variables de entorno definidas en el archivo .env se pueden utilizar con esto
// Es necesario importar esto para usar las variables de entorno
require('dotenv').config()

// Puede hacer referencia a las variables de entorno con esto
const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

module.exports = {
    MONGODB_URI,
    PORT
}