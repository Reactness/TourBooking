const crypto = require('crypto')
const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const bcrypt = require('bcryptjs')

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
   name: {
       type: String,
       required: [true, 'A user must have a name'],
       maxlength: [10, 'Name is too long'],
       minlength: [3, 'Name is too short'],
       trim: true,
   },
    slug: String,

    email: {
        type: String,
        required: [true, 'A user must have an email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },

    photo: {
        type: String,
    },
    role: {
       type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },

    password: {
       type: String,
        required: [true, 'Please provide a password'],
        maxlength: [16, 'Password must be less than 16 characters'],
        minlength: [4, 'Password must be more than 4 characters'],
        select: false
    },

    passwordConfirm: {
       type: String,
        required: [true, 'Please confirm your password'],
        validate: {
           validator: function (pass) {
                return pass === this.password
           },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()

})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTImestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTImestamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User