const Tour = require('../Models/tourModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const APIFeatures = require('../util/apiFeatures');
const User = require('../Models/userModel');
const Guide = require('../Models/guideModel');
const FavoriteList = require('../Models/faviorateModel');
const TourApplication = require('../Models/TourAppModel');
const UserSearch = require('../Models/userSearchModel');

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
      if (req.user) {
        await UserSearch.create({ user: req.user._id, search: place });
      }
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

    let showTours = tours;

    const user = req.user;
    // faviorate tours
    if(user){
        const favoriteLists = await FavoriteList.find({ user: req.user._id });
        const favoriteTourIds = favoriteLists.reduce((acc, list) => {
          acc.push(...list.tours);
          return acc;
        }, []);
        
        const toursWithFavoriteInfo = tours.map(tour => {
          let faviorate = false;
          favoriteTourIds.forEach(Id =>{
            if(tour._id.toString() === Id.toString()){
              faviorate = true;
            }
          })

          return { ...tour.toObject(), faviorate };
        });
        showTours = toursWithFavoriteInfo;
    }


    // Return a response with the fetched tours and pagination metadata
    res.status(200).json({
      status: 'success',
      pagination: {
        totalItems: totalToursCount,
        totalPages,
        currentPage: page,
        limit
      },
      data: showTours
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    next(error);
  }
});

  
exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  console.log(user);

  // Query the database to retrieve the tour with the specified ID
  const tour = await Tour.findById(id);

  // Check if the tour exists
  if (!tour) {
      return res.status(404).json({ status: 'error', message: 'Tour not found' });
  }

  // faviorate tours
  let faviorate = false;
  if(user){
  const favoriteLists = await FavoriteList.find({ user: req.user._id });
  const favoriteTourIds = favoriteLists.reduce((acc, list) => {
    acc.push(...list.tours);
    return acc;
  }, []);
  
    favoriteTourIds.forEach(Id =>{
      if(tour._id.toString() === Id.toString()){
        faviorate = true;
      }
    })
  }

  // Return a response with the fetched tour
  res.status(200).json({
      status: 'success',
      data: tour,
      faviorate
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // Extract the user from req.user
  const user = req.user;

  // Ensure user exists
  if (!user) {
      return res.status(400).json({ status: 'error', message: 'User not found' });
  }
  const guide = await Guide.find({ user: user._id});
  // console.log(guide[0]._id);

  // Create a new tour instance using the request body
  const newTourData = req.body;
  if(newTourData.tourCategory === 'user'){
    newTourData.user = user._id;
  }else{
    if(!guide){
      return res.status(400).json({ status: 'error', message: 'User is not a tour guide' });
    }
    newTourData.user = guide[0]._id;
  }
  console.log(newTourData.user);
  newTourData.creationDate = Date.now();
  if (req.files && req.files.length > 0) {
    newTourData.photos = req.files.map(file => file.path);
  }
  // console.log(req);
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
  // delete reviews
  if (!deletedTour) {
      return res.status(404).json({ status: 'failed', message: 'Tour not found' });
  }  
  res.status(200).json({
    status: 'success'
  })  
})

exports.updateTour = catchAsync(async (req , res , next) =>{
  const updates = req.body
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  // Update each field in the tour object
  Object.keys(updates).forEach(key => {
    tour[key] = updates[key];
  });
  if (req.files && req.files.length > 0) {
    tour.photos = req.files.map(file => file.path);
  }

  // Save the updated tour object
  await tour.save();

  res.status(200).json({
    status:'tour updated!',
    tour
  })
})

exports.deleteAllTours = catchAsync(async (req , res , next) =>{
  await Tour.deleteMany();

  res.status(200).json({
    "message": "all tours deleted successfully!"
  })
});


exports.getLastSearch = catchAsync(async (req , res , next) =>{
  const lastSearch = await UserSearch.find().sort({timestamp: -1});
  res.status(200).json({
    status: 'success',
    lastSearch
  })
})

exports.dashboard = catchAsync(async (req , res , next) =>{
  const clients = await User.countDocuments({tourType: 'user'});
  const admins = await User.countDocuments({tourType: 'admin'});
  const guides = await User.countDocuments({tourType: 'guide'});
  const tours = await Tour.countDocuments();
  const private_tours = await Tour.countDocuments({tourCategory: 'private'});
  const user_tours = await Tour.countDocuments({tourCategory: 'user'});
  const public_tours = await Tour.countDocuments({tourCategory: 'public'});
  const applications = await TourApplication.countDocuments();
  const finishedApplications = await TourApplication.countDocuments({status: 'finished'});
  const activeApplications = await TourApplication.countDocuments({status: 'active'});
  const upcommingApplications = await TourApplication.countDocuments({status: 'upcomming'});
  
  res.status(200).json({
    status: 'success',
    data: {
      clients,
      admins,
      guides,
      tours,
      private_tours,
      user_tours,
      public_tours,
      applications,
      finishedApplications,
      activeApplications,
      upcommingApplications
    }
  })
})