const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const Tour = require('../Models/tourModel');
const Guide = require('../Models/guideModel');
const Faviorate = require('../Models/faviorateModel');
const AppError = require('../util/appError');
const catchAsync = require("../util/catchAsync");
const ApiFeatures = require('../util/apiFeatures');



//create application for public and private tour 
//TODO: notification on private tour for guide
exports.createTourAppliaction = catchAsync(async (req, res, next) => {
    const user = req.user;
    const data = req.body;
    data.user = user;
    // const {tour , members , total_price , start_date , end_date , start_time} = req.body
    data.status = 'upcomming';
    const tourID = await Tour.findById(data.tour);
    if(tourID.tourCategory === 'public'){
    if(tourID.members + data.members <= tourID.participants){
        tourID.members = tourID.members + data.members;
        tourID.save();
    }else{
        return next(new AppError('remaining places isn\'t enough!'));
    }
    }else if(tourID.tourCategory === 'private'){
      //TODO: add notification here for guide
      // use tourID.user as the id of guide
      // message: (tourID.title) has been applied by (user) at (tourID.startDate)
    }
    
    const newTourApp = await TourApplication.create(data);

    res.status(201).json({
      status: "success",
      data: newTourApp
    });
  });

//create application for private guide
//TODO notification for guide
  exports.createGuideApplication = catchAsync(async (req , res , next) =>{
    const data = req.body;
    const user = req.user;
    data.user = user;
    data.status = 'pendening';
    // console.log(user._id.toString());
    const list = await Faviorate.find({user: user._id.toString() , name: 'Requested Tours'});
    const tour = await Tour.findById(data.tour);
    // console.log(list);
    // console.log(tour);
    if(tour.tourCategory !== 'user'){
        const newTour = await Tour.create({
            title:tour.title,
            user,
            photos:tour.photos,
            description:tour.description,
            itinerary:tour.itinerary,
            duration: tour.duration,
            tourType: tour.tourType, 
            itinerary:tour.itinerary, 
            meetingPoint:tour.meetingPoint,
            transportation:tour.transportation,
            included:tour.included,
            excluded:tour.excluded,
            cash: tour.cash,
            adult_price: data.adult_price,
            child_price: data.child_price,
            infant_price: data.infant_price,
            creation_date: Date.now(),
            tourCategory: 'user',
            faviorate: true,
            participants: data.participants,
            members: data.participants,
            cancelationPolicy: tour.cancelationPolicy,
            startDate: data.startDate,
            city: tour.city,
            country: tour.country,
        });
        data.tour = newTour._id.toString();
        // console.log(newTour);
    }
    // console.log(list[0].tours)
    list[0].tours.push(data.tour);
    list[0].save();
    console.log(list);
    data.creation_date = Date.now();

    const newGuideApp = (await GuideApplication.create(data)).populate('tour' , 'user' , 'tour_guide');

    //TODO: add notifiaction for guide here
    //use data.guide as the id of the guide
    //message: you have a new tour request please check it out!

    res.status(200).json({
        status: 'success',
        data: newGuideApp
    })
  });
  
//cancel application
//TODO notification for guide and client
  exports.cancelApplication = catchAsync(async (req , res , next) =>{
    const appId = req.params.appId;
    const Tourapplication = await TourApplication.findById(appId);
    const Guideapplication = await GuideApplication.findById(appId);
    if(Tourapplication){
      if(Date.now() < Tourapplication.start_date){
        //remove members
      const tour = await Tour.findById(Tourapplication.tour.toString());
      tour.members = tour.members - Tourapplication.members;
      tour.save();
      const tourCategory = tour.tourCategory;
      await TourApplication.findByIdAndDelete(appId);

      if(tourCategory === 'private'){
      //TODO: add notificaition here for guide and client
      //message for guide and client: (tour.title) application has been cancelled!
      }

      res.status(200).json({
        status: "application has been canceled successfully!",
        "data": TourApplication
      })

      }else{
        return next(new AppError('you can\'t cancel the application after begining the tour!'));
      }
        
    }else if(Guideapplication){
      if(Date.now() < Guideapplication.start_date){
      //remove tour from tours 
      const tour = await Tour.findById(Guideapplication.tour);
      const list = await Faviorate.find({user: tour.user.toString() , name: 'Requested Tours'});
      const tourIndex = list[0].tours.indexOf(Guideapplication.tour.toString());
      await Tour.deleteOne(tour._id);

      //remove tour from favriorate list
      console.log(list[0] , list[0].tours);
      list[0].tours.splice(tourIndex , 1);
      await list[0].save();
      console.log(list);
      await GuideApplication.findByIdAndDelete(appId);

      //TODO: add notificaition here for guide and client
      //message for guide and client: (tour.title) application has been cancelled!


      res.status(200).json({
        status: "application has been canceled successfully!",
        "data": Guideapplication
      })

      }else{
        return next(new AppError('you can\'t cancel the application after begining the tour!'));
      }
    }else{
      return next(new AppError('application isn\'t exist!' , 404));
    }
  });

//get one application
exports.getApplication = catchAsync(async (req , res , next) =>{
  const appId = req.params.appId;
  var app = await TourApplication.findById(appId);
  if(!app){
    app = await GuideApplication.findById(appId);
  }
  res.status(200).json({
    status:'success',
    app
  })
});

//get user applications (tours , guides)
exports.getUserApplications = catchAsync(async (req , res , next) =>{
  const userId = req.user._id;

  const filterdT = new ApiFeatures(TourApplication.find({user: userId}) , req.query).Filter();
  const filterdG = new ApiFeatures(GuideApplication.find({user: userId}) , req.query).Filter();

  const tours = await filterdT.query.populate('tour');
  const guides = await filterdG.query.populate('tour');

  let app = [];
  app.push.apply(app , tours);
  app.push.apply(app , guides);

  res.status(200).json({
    status:'success',
    applications: app
  })
});

//get guide requests
exports.getGuideApplications = catchAsync(async (req , res , next) =>{
  const userId = req.user._id;
  const guide = await Guide.find({user: userId});
  const guideApps = await GuideApplication.find({tour_guide: guide}).sort({ 'creation_date': 'desc' });

  res.status(200).json({
    status:'success',
    guideApps
  })
});

exports.getAllToursApplications = catchAsync(async (req , res , next) =>{
  const toursApp = await TourApplication.find();

  res.status(200).json({
    status:'success',
    toursApp
  })
})

exports.getAllGuidesApplications = catchAsync(async (req , res , next) =>{
  const guidesApp = await GuideApplication.find();
  
  res.status(200).json({
    status:'success',
    guidesApp
  })
})

exports.updateGuideApplicationStatuses = catchAsync(async () => {
  try {
      const now = new Date();

      // Find all applications that need status updates
      const applications = await GuideApplication.find({
          $or: [
              { status: { $ne: 'finished' }, end_date: { $lt: now } },
              { status: { $ne: 'active' }, start_date: { $lte: now }, end_date: { $gte: now } },
          ]
      });

      for (const app of applications) {
          let newStatus = app.status;
          if (now > app.end_date) {
              newStatus = 'finished';
          } else if (now >= app.start_date && now <= app.end_date) {
              newStatus = 'active';
          }
          
          if (newStatus !== app.status) {
              app.status = newStatus;
              await app.save();
          }
      }

      console.log(`Updated statuses of ${applications.length} applications.`);
  } catch (error) {
      console.error('Error updating application statuses:', error);
  }
});

exports.updateGuideApplicationStatuses = catchAsync(async () => {
  try {
      const now = new Date();

      // Find all applications that need status updates
      const applications = await TourApplication.find({
          $or: [
              { status: { $ne: 'finished' }, end_date: { $lt: now } },
              { status: { $ne: 'active' }, start_date: { $lte: now }, end_date: { $gte: now } },
          ]
      });

      for (const app of applications) {
          let newStatus = app.status;
          if (now > app.end_date) {
              newStatus = 'finished';
          } else if (now >= app.start_date && now <= app.end_date) {
              newStatus = 'active';
          }
          
          if (newStatus !== app.status) {
              app.status = newStatus;
              await app.save();
          }
      }

      console.log(`Updated statuses of ${applications.length} applications.`);
  } catch (error) {
      console.error('Error updating application statuses:', error);
  }
});