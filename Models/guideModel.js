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
    // liveIn:{
    //     country: String,
    //     city: String,
    //     location:{
    //         lat: Number,
    //         long: Number
    //     }
    // },
    aboutYou: String,
    hourPrice: Number,
    halfDayPrice: Number,
    dayPrice: Number,
    included: [String],
    guideIn: [String],
    identity_photo: String,
    identity_check: Boolean,
    show_tours: Boolean,
    fav_activities: String,
    rate: Number
    //calender????

})

const Guide = mongoose.model('Guide' , guideSchema);

module.exports = Guide;