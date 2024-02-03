const mongoose = require('mongoose');

exports.connect_db = () => {
    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.2zvplla.mongodb.net/`).then(() => {
        console.log('Connected to the database');
    }).catch(err => {
        console.log(`Failed to connect to the database :${err.message}`);
    })
}