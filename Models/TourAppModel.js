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
    members: Number,
    total_price: Number,// not as db design there is space missing
    start_date: Date,
    end_date: Date,
    start_time: Number,
    status: {
        type: String,
        enum:
        ['finished' , 'active' , 'upcomming'],
        default: 'upcomming'
    },
    creation_date: {
        type: Date,
        default: Date.now()
    }

});

TourApplicationSchema.pre('save', function(next) {
    const now = new Date();
    if (this.isNew) {
        if (now > this.end_date) {
            this.status = 'finished';
        } else if (now >= this.start_date && now <= this.end_date) {
            this.status = 'active';
        } else if (now < this.start_date) {
            this.status = 'upcoming';
        }
    }
    next();
});

module.exports = mongoose.model('TourApplication', TourApplicationSchema);