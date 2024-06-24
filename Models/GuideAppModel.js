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
        ['finished' , 'active' , 'pendening' , 'upcoming'],
        default: 'pendening'
    },
    creation_date: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to set the initial status
GuideApplicationSchema.pre('save', function(next) {
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

module.exports = mongoose.model('GuideApplication', GuideApplicationSchema);