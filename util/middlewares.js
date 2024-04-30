// Import necessary modules
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
// Function to create the protect middleware
const protect = (requiredRoles = []) => {
    return async (req, res, next) => {
        try {
            // Get the token from the request headers
            const token = req.headers.authorization.split(' ')[1];
            //   console.log(token)
            // Check if token exists
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized - Missing token' });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your actual secret key
            // Check if the user exists
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized - User not found' });
            }
            // Check if the decoded user has the required roles
            const userRoles = user.user_types || [];
            var rule = false;
            // console.log(userRoles)
            const hasRequiredRoles = requiredRoles.forEach(role =>{
                // console.log(role);
                 const hasRule = userRoles.includes(role);
                //  console.log(hasRule)
                 if(hasRule){
                    rule = true;
                 }
                //  console.log(rule);
                });
            // console.log(hasRequiredRoles);
            if (!rule) {
                return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
            }

            // Attach the decoded user information to the request object for further use
            req.user = user;

            // Move to the next middleware
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
    };
};

module.exports = protect;
