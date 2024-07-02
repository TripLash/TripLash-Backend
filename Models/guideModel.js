const mongoose = require('mongoose');


const languageSchema = new mongoose.Schema({
    name: String,
    experience: String
});

const guideSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , 'You must create account as user first!'],
        unique: [true , 'user already have guide account']
    },
    languages:[languageSchema],
    aboutYou: String,
    hourPrice: Number,
    halfDayPrice: Number,
    dayPrice: Number,
    included: [String],
    guideIn: [String],
    identity_photo_front: String, 
    identity_photo_back: String, 
    identity_ID: {
        type: Number,
        required: [true, 'Guide must have an identity!']
    },
    show_tours: Boolean,
    fav_activities: [String],
    rate: {
        type: Number,
        default: 0
    },
    rateQuantity:{
        type: Number,
        default: 0
    },
    city: String,
    country: String
})

const Guide = mongoose.model('Guide' , guideSchema);

module.exports = Guide;