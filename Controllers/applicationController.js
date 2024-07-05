const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const Tour = require('../Models/tourModel');
const Guide = require('../Models/guideModel');
const Faviorate = require('../Models/faviorateModel');
const AppError = require('../util/appError');
const catchAsync = require("../util/catchAsync");
const ApiFeatures = require('../util/apiFeatures');
const {NOTIFICATION_TYPES} = require('../constants/notification-types');
const {sendFCMNotification} = require('../util/generics');




//create application for public and private tour 
// notification on private tour for guide
exports.createTourAppliaction = catchAsync(async (req, res, next) => {
    const user = req.user;
    const data = req.body;
    data.user = user;
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
      const username = `${user.firstname} ${user.lastname}`
      await sendFCMNotification(tourID.user, 'New Application', `${tourID.title} has been applied by ${username} at ${tourID.startDate}`);
    }
    
    const newTourApp = await TourApplication.create(data);

    const showData = await TourApplication.find(newTourApp).populate('tour user');


    res.status(201).json({
      status: "success",
      data: showData[0]
    });
  });

//create application for private guide
//notification for guide
  exports.createGuideApplication = catchAsync(async (req , res , next) =>{
    const data = req.body;
    const user = req.user;
    data.user = user;
    data.status = 'pendening';
    const list = await Faviorate.find({user: user._id.toString() , name: 'Requested Tours'});
    const tour = await Tour.findById(data.tour);
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
    }
    list[0].tours.push(data.tour);
    list[0].save();
    data.creation_date = Date.now();

    const newGuideApp = await GuideApplication.create(data)
    // newGuideApp.populate('tour' , 'user' , 'tour_guide');
    const showData = await GuideApplication.find(newGuideApp).populate('tour user tour_guide');

    console.log(newGuideApp);
    await sendFCMNotification(newGuideApp.tour_guide, 'New Application', 'you have a new tour request please check it out!', NOTIFICATION_TYPES.MENU);
    res.status(200).json({
        status: 'success',
        data: showData[0]
    })
  });
  
//cancel application
//notification for guide and client
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
      

      if(tourCategory === 'private'){
      //add notificaition here for guide and client
      //message for guide and client: (tour.title) application has been cancelled!
      // send notification to the client
      await sendFcmNotification(TourApplication.user, 'Application Canceled', `${tour.title} application has been cancelled!`, NOTIFICATION_TYPES.MENU); 
      // // send notification to the guide
      await sendFcmNotification(TourApplication.tour.user, 'Application Canceled', `${tour.title} application has been cancelled!`, NOTIFICATION_TYPES.MENU); 

      await TourApplication.findByIdAndDelete(appId);
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

      //add notificaition here for guide and client
      //message for guide and client: (tour.title) application has been cancelled!

      await sendFcmNotification(GuideApplication.user, 'Application Canceled', `${tour.title} application has been cancelled!`, NOTIFICATION_TYPES.MENU); 
      // // send notification to the guide
      await sendFcmNotification(GuideApplication.tour_guide, 'Application Canceled', `${tour.title} application has been cancelled!`, NOTIFICATION_TYPES.MENU); 

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
  var app = await TourApplication.findById(appId).populate('tour user');
  if(!app){
    app = await GuideApplication.findById(appId).populate('tour user tour_guide')
    .populate({
      path: 'tour_guide',
      populate: 'user'
    });
  }
  res.status(200).json({
    status:'success',
    app
  })
});

//get user applications (tours , guides)
exports.getUserApplications = catchAsync(async (req , res , next) =>{
  const status = req.query.status;
  const userId = req.user._id;
  let query = {user: userId};
  query.user = userId;
  if(status){
    query.status = status;
  }
  const toursApp = await TourApplication.find(query).populate('tour user');
  const guidesApp = await GuideApplication.find(query).populate('tour user tour_guide');

  let app = [];
  app.push.apply(app , toursApp);
  app.push.apply(app , guidesApp);

  res.status(200).json({
    status:'success',
    applications: app
  })
});

//get guide requests
exports.getGuideApplications = catchAsync(async (req , res , next) =>{
  const userId = req.user._id;
  const guide = await Guide.find({user: userId});
  const guideApps = await GuideApplication.find({tour_guide: guide}).sort({ 'creation_date': 'desc' }).populate('tour user tour_guide');

  res.status(200).json({
    status:'success',
    guideApps
  })
});

exports.getAllToursApplications = catchAsync(async (req , res , next) =>{
  const toursApp = await TourApplication.find().populate('tour user' );

  res.status(200).json({
    status:'success',
    toursApp
  })
})

exports.getAllGuidesApplications = catchAsync(async (req , res , next) =>{
  const guidesApp = await GuideApplication.find().populate('tour user')
  .populate({
    path: 'tour_guide',
    populate: 'user'
  });
  
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

exports.updateTourApplicationStatuses = catchAsync(async () => {
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