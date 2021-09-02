const auth = require('./auth');
const user = require('./user');

const apiEndPoint = '/api'

module.exports = app => {
	app.use(`${apiEndPoint}/auth`, auth)
	app.use(`${apiEndPoint}/user`, user)
}