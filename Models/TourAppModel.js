const mongoose = require('mongoose');


const TourApplicationSchema = new mongoose.Schema({
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
    participants: Number,
    total_price: Number,// not as db design there is space missing
    start_date: Date,
    end_date: Date,
    start_time: Number,
    status: {
        type: String,
        enum:
        ['finished' , 'active' , 'upcomming']
    },

});

module.exports = mongoose.model('TourApplication', TourApplicationSchema);