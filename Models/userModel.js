const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: [true , 'please enter your first name']
    },
    lname:{
        type: String,
        required: [true , 'please enter your last name']
    },
    email: {
        type: String,
        required: [true, 'please enter your email'],
        validate: [validator.isEmail, 'please enter valid email'],
        unique: true,
        lowercase: true,
    },
    mobile:{
        type: Number,
        validate: [validator.isMobilePhone , 'please enter valid mobile phone']
    },
    password: {
        type: String,
        required: [true, 'please enter password'],
        minlength: 8,
        select: false,
    },
    country:{
        type: String,
        //Don't know what to put else here
    },
    city:{
        type: String,
        //Don't know what to put else here

    },
    birth_date:{
        type: Date
    },
    user_type:{
        type: String,
        enum: ['user' , 'guide' , 'admin']
    },
    language:{
        type: String,
        //isn't it in english only?
        enum: ['Arabic' , 'English']
    },
    currancy:{
        type: String,
    }
})

userSchema.method.correctPassword = function(candidatePassword , userPassword){
    return bcrypt.compare(candidatePassword , userPassword);
}

const User = mongoose.model('User' , userSchema);

module.exports = User;