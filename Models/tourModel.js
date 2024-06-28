const mongoose = require('mongoose');
const Review = require('./reviewModel');


const placeDetailSchema = new mongoose.Schema({
    description: String,
        location: {
            lat: Number,
            long: Number
        }
})
const itinerarySchema = new mongoose.Schema({
    title: String,
    objects: [placeDetailSchema]
});


const tourSchema = new mongoose.Schema({
    title:{
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
    duration: {
        type: Number,
        default: 0
    },
    tourType: [{
        type: String,
        //TODO 
        enum: ['Bus Tour' , "Day Trip" , 'Walking Tour' , 'Food & Drink' , 'Bike Tour' , 'cruises'],
        required: [true , 'specify tour type please!']
    }],
    ratingsAverage:{
        type: Number,
        default: 0, // Added default value
        // min: [1 , 'rating must be above 1.0'],
        // max: [5 , 'rating must be under 5.0'],
        set: val => Math.round(val * 10) / 10
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
        type: placeDetailSchema
    },
    transportation:{
        type: String,
        //TODO
        enum: ['Car' , 'Bus']
    },
    included:[String],
    excluded:[String],
    cash:[String],
    adult_price:{
        type: Number,
        required: [true , "tour must have adult price!"]
    },
    child_price:{
        type: Number,
        required: [true , "tour must have child price!"]
    },
    infant_price:{
        type: Number,
        required: [true , "tour must have infant price!"]
    },
    tourCategory:{
        type: String,
        enum: ['private', 'public' , 'user'],
        default:"public"
    },
    creation_date: Date,
    // faviorate: {
    //     type: Boolean,
    //     default: false
    // },
    participants: Number,
    members:{
        type: Number,
        default: 0
    },
    cancelationPolicy:[String],
    startDate: {
        type: Date,
    },
    city: String,
    country: String
});



// Middleware to calculate ratingsAverage
tourSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await Review.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await this.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await this.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        });
    }
};

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;