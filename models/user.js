const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Token = require('./token')
const crypto = require('crypto')

const UserSchema = mongoose.Schema({
	username: { type: String, unique: true },
	email: { type: String, unique: true },
	password: String,
	isVerified: { type: Boolean, default: false },
	avatar: String
})

UserSchema.pre('save', function (next) {
	const user = this
	if (!user.isModified('password')) return next()

	bcrypt.hash(user.password, 10, (err, hash) => {
		if (err) return next(err)
		user.password = hash
		next()
	})
})

UserSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.generateJWT = function () {
	const payload = { id: this._id, email: this.email, username: this.username, avatar: this.avatar || '' }
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2hr' })
}

UserSchema.methods.generatePasswordReset = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString('hex')
	this.resetPasswordExpires = Date.now() + 3600000
};

UserSchema.methods.generateVerificationToken = function () {
	let payload = {
		userId: this._id,
		token: crypto.randomBytes(20).toString('hex')
	}
	return new Token(payload)
}

module.exports = mongoose.model('User', UserSchema)