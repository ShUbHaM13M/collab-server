
if (process.env.NODE_ENV != 'production') {
	require('dotenv').config()
}
const PORT = process.env.PORT || 3000

const express = require('express')
const app = express()
const mongoose = require('mongoose')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => console.log('DB Connected'))
	.catch(err => console.error(err.message))

app.get('/wake-up', (_, res) => {
	// const timer = ms => new Promise(res => setTimeout(res, ms));
	// test timer
	// timer(2000).then(_ => res.status(200).json({ status: 'running' }))
	return res.status(200).json({ status: 'running' })
})

require('./routes/index')(app)

const server = app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`)
})