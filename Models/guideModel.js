const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({

})

const Guide = mongoose.model('Guide' , guideSchema);

module.exports = Guide;