const express = require('express')
const jwt = require('jsonwebtoken')
const ResTypes = require('../utils/resTypes')

const router = express.Router()
const tokenPrefix = 'Bearer'

const notAuthenticatedMessage = {
	message: 'Not Authenticated',
	type: ResTypes.DANGER
}

router.get('/', (req, res) => {
	const authHeader = req.get("Authorization")
	if (!authHeader)
		return res.status(401).json(notAuthenticatedMessage)

	const [prefix, token] = authHeader.split(' ')

	if (prefix === tokenPrefix) {
		let decodedToken
		try {
			decodedToken = jwt.verify(token, process.env.JWT_SECRET)
		} catch (err) {
			return res.status(500).json({
				message: err.message || 'Could not decode the token',
				type: ResTypes.DANGER
			})
		}

		if (decodedToken)
			return res.status(200).json({
				message: 'Authorized',
				user: decodedToken,
				type: ResTypes.SUCCESS
			})

	}

	return res.status(401).json(notAuthenticatedMessage)
})

module.exports = router