const mongoose = require('mongoose');

const ID = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: String
});

module.exports = mongoose.model('ID' , ID);