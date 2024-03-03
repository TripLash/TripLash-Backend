const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true , 'tour must contain name']
    },
    photos: [String],
    guide:{
        type: mongoose.Schema.ObjectId,
        ref: 'Guide',
        required: [true , 'tour must have tour guide']
    },
    description:{
        type: String,
        required: [true , 'tour must have description']
    },
    duration: Number,
    tourType: {
        type: String,
        enum: ['Bus Tour' , "Day Trip" , 'Walking Tour' , 'Food & Drink' , 'Bike Tour' , 'cruises'],
        required: [true , 'specify tour type please!']
    },
    itinerary:[{
        title: String,
        objects: [{
            description: String,
            location: {
                name: String,
                lat: Number,
                long: Number
            }
        }]
    }],
    meetingPoint:{
        description: String,
        location: {
            name: String,
            lat: Number,
            long: Number
        }
    },
    transportation:{
        type: String,
        enum: ['Car' , 'Bus']
    },
    included:[String],
    excluded:[String],
    cash:[String],
    reviews:{
        type: mongoose.Schema.ObjectId,
        ref: 'Review'
    }
});

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;