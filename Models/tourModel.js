const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
    title: String,
    objects: [{
        description: String,
        location: {
            name: String,
            lat: Number,
            long: Number
        }
    }]
});

const meetingPointSchema = new mongoose.Schema({
    description: String,
    location: {
        name: String,
        lat: Number,
        long: Number
    }
});


const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true , 'tour must contain name']
    },
    photos: [String],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
         required: [true , 'tour must have tour guide']
    },
    description:{
        type: String,
        required: [true , 'tour must have description']
    },
    duration: Number,
    tourCategory: {
        type: String,
        enum: ['Bus Tour' , "Day Trip" , 'Walking Tour' , 'Food & Drink' , 'Bike Tour' , 'cruises'],
        required: [true , 'specify tour type please!']
    },
    ratingsAverage:{
        type: Number,
        default: 0, // Added default value
        min: [1 , 'rating must be above 1.0'],
        max: [5 , 'rating must be under 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
      },
    itinerary:[{
        title: String,
        objects: [itinerarySchema]
    }],
    meetingPoint:{
        type: meetingPointSchema
    },
    transportation:{
        type: String,
        enum: ['Car' , 'Bus']
    },
    included:[String],
    excluded:[String],
    cash:[String],
    // reviews:[{
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    // }],
    price:{
        type: Number,
        required: [true , "tour must have price!"]
    },
    tourType:{
        type: String,
        enum: ['private', 'public'],
        default:"public"
    }
});

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;