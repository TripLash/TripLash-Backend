const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: [true , 'please enter your first name']
    },
    lastname:{
        type: String,
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
        required: [true, 'please enter valid mobile phone']
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
    user_types:{
        type: [
            String
        ],
        enum: ['client' , 'guide' , 'admin'],
        default: ['client']
    },
    // profile language, 
    language:{
        type: String,
        enum: ['A' , 'E'],
        default: 'E'
    },
    currancy:{
        type: String,
    },
    code: {
        type: String
    },
    code_timestamps: {
        type: Date
    },
    user_tours:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    }]
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    try {
      // Check if the password is modified
      if (!this.isModified('password')) {
        return next();
      }
  
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
  
      // Hash the password with the generated salt
      const hashedPassword = await bcrypt.hash(this.password, salt);
  
      // Replace the plain text password with the hashed one
      this.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
});

// Add a method to add a new role to a user
userSchema.methods.addRole = function (newRole) {
    if (!this.user_types.includes(newRole)) {
      this.user_types.push(newRole);
    }
};

userSchema.methods.checkPassword = async function (providedPassword) {
    try {
      if (!providedPassword) {
        throw new Error('Provided password is required');
      }
  
      // Use bcrypt to compare the provided password with the hashed password
      return await bcrypt.compare(providedPassword, this.password);
    } catch (error) {
      throw error;0
    }
};

const User = mongoose.model('User' , userSchema);

module.exports = User;