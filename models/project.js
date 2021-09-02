const mongoose = require('mongoose')
const Task = require('./task')

const ProjectSchema = mongoose.Schema({
	name: { type: String, required: true },
	tasks: {
		type: [Task],
		required: false,
	},
	description: String,
	members: {
		type: [{
			id: mongoose.Schema.Types.ObjectID,
			isOwner: { type: Boolean, default: false }
		}],
		ref: 'users'
	}
}, { timestamps: true })

module.exports = mongoose.model('project', ProjectSchema)