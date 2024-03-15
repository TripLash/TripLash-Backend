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
  
  exports.GetAllTours = catchAsync(async (req, res, next) => {
    //Executing Query
    const Features = new APIFeatures(Tour.find(), req.query)
      .Filter()
      .Sorting()
      .LimitFields()
      .Pagination();
    const tours = await Features.query;
  
    //Send Response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  });
  
  exports.GetTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
  
    if (!tour) {
      return next(new AppError('Tour Is Not Found!', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  });
  
  //TODO update this end point
  exports.CreateTour = catchAsync(async (req, res, next) => { // remaining("add tour to guide tours")s

    const tour = req.body;
    const user = tour.user;

    const newTour = await Tour.create(req.body);
    const checkUser = await User.findById(user);

    // const query = {user : `${checkUser._id}`}
    const guide = await Guide.findOne({user : `${checkUser._id}`}); // don't work s

    if(!checkUser.user_types.includes('guide')){ 
      newTour.tourType = 'private_user';
      newTour.save();
      // add tour to user tours
      checkUser.user_tours.push(newTour._id);
      checkUser.save();
    }// else add tour to guide tours s
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
  });


  //ratingsAverage and ratingsQuantity need to be updated each time a review is added s