const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})


schema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name description -guides'
    })
    next()
})

module.exports = mongoose.model('Booking', schema)