const mongoose = require('mongoose');

const faviorateSchema = new mongoose.Schema({
    name: String,
    user: {
        type : mongoose.Types.ObjectId,
        ref  : 'User',
    },
    tours: [{
        type : mongoose.Types.ObjectId,
        ref  : 'Tour',
    }]
})

const Faviorate = mongoose.model( 'Faviorate' , faviorateSchema)

module.exports = Faviorate;