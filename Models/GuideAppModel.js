const mongoose = require('mongoose');


const GuideApplicationSchema = new mongoose.Schema({
    tour: {
        type : mongoose.Types.ObjectId,
        ref  : 'Tour',
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tour_guide:{
        type : mongoose.Types.ObjectId,
        ref  : 'Guide',
        required: true
    },
    participants: Number,
    adult_price: Number,
    child_price: Number,
    infant_price: Number,
    start_date: Date,
    end_date: Date,
    start_time: Number,
    status: {
        type: String,
        enum:
        ['finished' , 'active' , 'pendening' , 'upcoming']
    },
    creation_date: Date
});

module.exports = mongoose.model('GuideApplication', GuideApplicationSchema);