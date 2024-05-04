
const GuideAppModel = require('../Models/GuideAppModel');
const GuideApplication = require('../Models/GuideAppModel');
const TourApplication = require('../Models/TourAppModel');
const Tour = require('../Models/tourModel');
const Guide = require('../Models/guideModel');
const Faviorate = require('../Models/faviorateModel');
const AppError = require('../util/appError');
const catchAsync = require("../util/catchAsync");



// create application for public and private tour 
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
    }
    // console.log(data);
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
    // console.log(user._id.toString());
    const list = await Faviorate.find({user: user._id.toString() , name: 'Requested Tours'});
    const tour = await Tour.findById(data.tour);
    const guide = await Guide.findById(data.tour_guide);
    console.log(list);
    // console.log(tour);
    if(tour.tourCategory !== 'user'){
        const newTour = await Tour.create({
            title:tour.title,
            user,
            description:tour.description,
            duration: tour.duration,
            tourType: tour.tourType, 
            itinerary:tour.itinerary, 
            meetingPoint:tour.meetingPoint,
            transportation:tour.transportation,
            included:tour.included,
            excluded:tour.excluded,
            cancelationPolicy: tour.cancelationPolicy,
            price: data.total_price,
            city: tour.city,
            country: tour.country,
            participants: data.participants,
            members: data.participants,
            startDate: data.startDate,
            tourCategory: 'user',
            faviorate: true,
        });
        data.tour = newTour._id.toString();
        // console.log(newTour);
    }
    // console.log(list[0].tours)
    list[0].tours.push(data.tour);
    list[0].save();
    console.log(list);

    const newGuideApp = await GuideApplication.create(data);

    res.status(200).json({
        status: 'success',
        data: newGuideApp
    })
  });
  

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
      await TourApplication.findByIdAndDelete(appId);
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
      }else{
        return next(new AppError('you can\'t cancel the application after begining the tour!'));
      }
    }else{
      return next(new AppError('application isn\'t exist!' , 404));
    }

    res.status(200).json({
      status: "application has been canceled successfully!"
    })
  });

//TODO
exports.getApplication = catchAsync(async (req , res , next) =>{

});

//TODO
exports.getAllApplications = catchAsync(async (req , res , next) =>{

})