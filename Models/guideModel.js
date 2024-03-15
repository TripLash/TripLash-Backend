const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true , 'You must create account as user first!'],
        unique: [true , 'user already have guide account']
    },
    languages:[{
        type: String,
        //degree: {    // make sure we will use it
        //    type: String,
        //    enum: ['fluent' , 'native' , 'good' , 'bad']
        //},
        required: [true , 'You must enter languages you speak!']
    }],
    liveIn:{
        country: String,
        city: String,
        location:{
            lat: Number,
            long: Number
        }
    },
    aboutYou: String,
    hourPrice: Number,
    hdayPrice: Number,
    dayPrice: Number,
    included: [String],
    guideIn: [String],
    identity_photo: String,
    identity_check: Boolean,
    guide_tours:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    }],
    show_tours: Boolean,
    fav_activities: String,
    //calender????

})

const Guide = mongoose.model('Guide' , guideSchema);

module.exports = Guide;