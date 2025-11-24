const express = require('express')
const app = express()

const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const apiRoutes = require('./routes'); // <-- routes/index.js
app.use('/api', apiRoutes);

// Default test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working' })
})

module.exports = app
