const Tour = require('../Models/tourModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const APIFeatures = require('../util/apiFeatures');
const User = require('../Models/userModel');
const Guide = require('../Models/guideModel');




//TODO don't work
exports.aliasTopTours = (req, res, next) => { // don't work why?????s
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
  };
 
  //TODO filter tours , startdate is greater than date.now()
exports.getTours = catchAsync(async (req, res, next) => {
  // Pagination options
  const page = parseInt(req.query.page) || 1; // Default page number is 1
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 tours per page
  const skip = (page - 1) * limit; // Calculate skip value

  // Sorting options
  const sortField = req.query.sortBy || 'createdAt'; // Default sort field is 'createdAt'
  const sortOrder = req.query.sortOrder || 'desc'; // Default sort order is descending


  // Query options
  const query = (await Tour.find().populate('itinerary').populate('meetingPoint'));
  query.sort({ [sortField]: sortOrder }); // Apply sorting
  query.skip(skip).limit(limit); // Apply pagination


  // Execute the query to fetch tours and count total number of tours
  const [tours, totalToursCount] = await Promise.all([
      query.exec(),
      Tour.countDocuments()
  ]);

  // Calculate total number of pages
  const totalPages = Math.ceil(totalToursCount / limit);

  // Return a response with the fetched tours and pagination metadata
  res.status(200).json({
      status: 'success',
      pagination: {
          totalItems: totalToursCount,
          totalPages,
          currentPage: page,
          limit
      },
      data: tours
  });
});
  
exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Query the database to retrieve the tour with the specified ID
  const tour = await Tour.findById(id);

  // Check if the tour exists
  if (!tour) {
      return res.status(404).json({ status: 'error', message: 'Tour not found' });
  }

  // Return a response with the fetched tour
  res.status(200).json({
      status: 'success',
      data: tour
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // Extract the user from req.user
  const user = req.user;

  // Ensure user exists
  if (!user) {
      return res.status(400).json({ status: 'error', message: 'User not found' });
  }

  // Create a new tour instance using the request body
  const newTourData = req.body;
  newTourData.user = user._id; // Associate the user with the tour
  if(newTourData.tourType === 'user') {
    newTourData.faviorate = true;
  };
  //TODO is it legal to equal two lists??
  const newTour = new Tour(newTourData);

  // Save the new tour to the database
  const createdTour = await newTour.save();

  // Return a response with the created tour data
  res.status(201).json({
    status: 'success',
    data: createdTour
  });
})
//ratingsAverage and ratingsQuantity need to be updated each time a review is added s

//TODO
exports.deleteTour = catchAsync(async (req , res , next) =>{

})

//TODO + add tour to faviorate
exports.updateTour = catchAsync(async (req , res , next) =>{

})