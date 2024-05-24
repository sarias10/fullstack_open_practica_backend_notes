const app = require('./app') // the actual Express application
const logger = require('./utils/logger')

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`)
})
