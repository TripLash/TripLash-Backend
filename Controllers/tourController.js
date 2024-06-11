const Tour = require('../Models/tourModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const APIFeatures = require('../util/apiFeatures');
const User = require('../Models/userModel');
const Guide = require('../Models/guideModel');
const TourApplication = require('../Models/TourAppModel');




//TODO don't work
exports.aliasTopTours = (req, res, next) => { // don't work why?????s
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
  };
 
/*
  - Search by place => done
  - filter by tour guide languages, category, budget => done
*/
exports.getTours = catchAsync(async (req, res, next) => {
  try {
    // Pagination options
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting options
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Determine sort order based on sortOrder parameter

    // Search options
    const { place, maxPrice, tourTypes, languages } = req.query;
    let searchFilter = {};

    // Place filter
    if (place) {
      const placeRegex = new RegExp(place, 'i'); // 'i' for case-insensitive
      searchFilter = {
        ...searchFilter,
        $or: [
          { title: { $regex: placeRegex } },
          { description: { $regex: placeRegex } }
        ]
      };
    }

    // Price filter
    if (maxPrice) {
      searchFilter = {
        ...searchFilter,
        price: { $lte: parseFloat(maxPrice) }
      };
    }

    // Tour types filter
    if (tourTypes) {
      const typesArray = Array.isArray(tourTypes) ? tourTypes : [tourTypes];
      searchFilter = {
        ...searchFilter,
        tourType: { $in: typesArray }
      };
    }

    // Debug: Log the search filter
    console.log('Search Filter:', searchFilter);

    // Build the query with optional population of related fields
    let query = Tour.find(searchFilter).populate('itinerary').populate('meetingPoint');
    // Filter by guide languages
    if (languages) {
      const languagesArray = Array.isArray(languages) ? languages : [languages];
      // Use aggregate to join with Guide and User collections
      query = Tour.aggregate([
        {
          $lookup: {
            from: 'guides',
            localField: 'user',
            foreignField: 'user',
            as: 'guide'
          }
        },
        { $unwind: '$guide' },
        {
          $match: {
            'guide.languages.name': { $in: languagesArray }
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $sort: { [sortField]: sortOrder }
        }
      ]);
    }
    // console.log(searchFilter);
    // Apply sorting and pagination to the query
    query.sort({ [sortField]: sortOrder }).skip(skip).limit(limit);

    // Debug: Log the final query
    // console.log('Final Query:', query);

    // Execute the query to fetch tours and count total number of tours
    const [tours, totalToursCount] = await Promise.all([
      query.exec(),
      Tour.countDocuments(searchFilter)
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
  } catch (error) {
    console.error('Error fetching tours:', error);
    next(error);
  }
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

exports.deleteTour = catchAsync(async (req , res , next) =>{
  const tourId = req.params.id;
  const deletedTour = await Tour.findByIdAndDelete(tourId);
  await TourApplication.deleteMany({tour: tourId});
  //TODO delete reviews
  if (!deletedTour) {
      return res.status(404).json({ status: 'failed', message: 'Tour not found' });
  }  
  res.status(200).json({
    status: 'success'
  })  
})

//TODO + add tour to faviorate
exports.updateTour = catchAsync(async (req , res , next) =>{

})