const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: String,
    body: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , 'notification must belong to a user']
    },
    readStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification' , notificationSchema);

module.exports = Notification;