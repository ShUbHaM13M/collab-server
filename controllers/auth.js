const User = require('../models/user')
const Token = require('../models/token')
const types = require('../utils/resTypes')
const sendEmail = require('../utils/sendmail')

exports.register = async (req, res) => {
	try {
		const { email } = req.body
		const _user = await User.findOne({ email })

		if (_user) return res.status(401).json({
			message: 'Entered email address is already associated with another account',
			type: types.DANGER
		})

		const newUser = new User({ ...req.body })
		const user = await newUser.save()
		await sendVerificationEmail(user, req, res)

	} catch (err) {
		res.status(500).json({ type: types.DANGER, message: err.message })
	}
}

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })

		if (!user) return res.status(401).json({
			message: "The entered email address is not associated with any account.",
			type: types.DANGER
		})

		if (!user.comparePassword(password))
			return res.status(401).json({
				message: 'Incorred password',
				type: types.DANGER
			})

		if (!user.isVerified)
			return res.status(401).json({
				message: 'Your email is not verified',
				type: types.DANGER
			})

		return res.status(200).json({
			token: user.generateJWT(),
			type: types.SUCCESS
		})

	} catch (error) {
		res.status(500).json({
			message: error.message,
			type: types.DANGER
		})
	}
}

exports.verify = async (req, res) => {
	if (!req.params.token)
		return res.status(400).json({
			message: "We were unable to find a user for this token.",
			type: types.DANGER
		})

	try {
		const token = await Token.findOne({ token: req.params.token })

		if (!token)
			return res.status(400).json({
				message: "We were unable to find a user for this token.",
				type: types.DANGER
			})

		User.findOne({ _id: token.userId }, (_, user) => {
			if (!user)
				return res.status(400).json({
					message: 'We were unable to find a user for this token.',
					type: types.DANGER
				})

			if (user.isVerified)
				return res.status(400).json({
					message: 'User already Verified',
					type: types.DANGER
				})

			user.isVerified = true
			user.save((err) => {
				if (err)
					return res.status(500).json({
						message: err.message,
						type: types.DANGER
					})

				res.status(200).send("Your account has been verified")
			})
		})

	} catch (err) {
		res.status(500).json({
			message: error.message,
			type: types.DANGER
		})
	}
}

exports.resendToken = async (req, res) => {
	try {
		const { email } = req.body

		const user = await User.findOne({ email })

		if (!user)
			return res.status(401).json({
				message: `The email address${req.body.email} is not associated with any account`,
				type: types.DANGER
			})

		if (user.isVerified)
			return res.status(400).json({
				message: 'This account has already been verified. Please log in.',
				type: types.DANGER
			})

		await sendVerificationEmail(user, req, res);
	} catch (error) {
		res.status(500).json({
			message: error.message,
			type: types.DANGER
		})
	}
}

async function sendVerificationEmail(user, req, res) {
	try {
		const token = user.generateVerificationToken()

		await token.save()

		let subject = "Account Verification Token"
		let to = user.email
		let from = process.env.FROM_EMAIL
		let link = `http://${req.headers.host}/api/auth/verify/${token.token}`
		//change the mail
		let html = `<p>Welcome to Collab</p>
    <br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
    <br><p>If you did not request this, please ignore this email.</p>`

		await sendEmail({ from, to, subject, html })

		res.status(200).json({
			type: types.SUCCESS,
			message: `A verification email has been sent to ${user.email}.`
		})

	} catch (error) {
		res.status(500).json({
			message: error.message,
			type: types.DANGER
		})
	}
}