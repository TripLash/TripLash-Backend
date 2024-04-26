
const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const Tour = require('../Models/tourModel');
const AppError = require('../util/appError');
const catchAsync = require("../util/catchAsync");



// create application for public and private tour 
exports.createTourAppliaction = catchAsync(async (req, res, next) => {
    const user = req.user;
    const data = req.body;
    data.user = user;
    data.status = 'upcomming';
    const tour = await Tour.findById(data.tour);
    if(tour.tourCategory === 'public'){
    if(tour.members + data.participants <= tour.participants){
        tour.members = tour.participants + data.participants;
        tour.save();
    }else{
        return next(new AppError('remaining places isn\'t enough!'));
    }
    }
    console.log(data);
    const newTourApp = await TourApplication.create(data);
    res.status(201).json({
      status: "success",
      data: newTourApp
    });
  });

  exports.createGuideApplication = catchAsync(async (req , res , next) =>{
    const data = req.body;
    const user = req.user;
    data.user = user;
    data.status = 'pendening';
    const list = await Faviorate.find({user: user._id , name: 'Requested Tours'});
    const tour = await Tour.findById(data.tourId);
    
    if(tour.tourCategory !== 'user'){
        const newTour = await Tour.create({
            title:tour.title,
            user,
            description:tour.description,
            duration: tour.duration,
            tourType: tour.tourType, //TODO  is it legal to equal two lists?
            itinerary:tour.itinerary, //TODO same question
            meetingPoint:tour.meetingPoint,
            transportation:tour.transportation,
            included:tour.included,//TODO same question
            excluded:tour.excluded,//TODO same question
            tourCategory: 'user',
            faviorate: true,
        });
        data.tourId = newTour._id;
    }
    
    list.tours.push(data.tourId);
    list.save();

    const newGuideApp = await GuideApplication.create(data);

    res.status(200).json({
        status: 'success',
        data: newGuideApp
    })
  });
  
  //TODO
  exports.cancelApplication = catchAsync(async (req , res , next) =>{
  
  });

//TODO
exports.getApplication = catchAsync(async (req , res , next) =>{

});

//TODO
exports.getAllApplications = catchAsync(async (req , res , next) =>{

})