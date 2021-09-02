const mongoose = require('mongoose')

const TaskSchema = mongoose.Schema({
	title: { type: String, required: true },
	description: String,
	status: {
		type: String,
		enum: ['completed', 'in_progess', 'not_started'],
		default: 'not_started'
	}
}, { timestamps: true })

module.exports = mongoose.model('task', TaskSchema)