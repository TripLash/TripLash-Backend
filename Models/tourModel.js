const mongoose = require('mongoose');

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
        min: [1 , 'rating must be above 1.0'],
        max: [5 , 'rating must be under 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
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
    reviews:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Review'
    }],
    price:{
        type: Number,
        required: [true , "tour must have price!"]
    },
    owner:{
        type: String,
        enum: ['private_user' , 'private_guide' , 'puplic_guide'],
        default:"private_user"
    }
});

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;