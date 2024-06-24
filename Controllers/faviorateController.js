const catchAsync = require('../util/catchAsync');
const Faviorate = require('./../Models/faviorateModel');
// const User = require('./../Models/userModel');
const Tour = require('./../Models/tourModel');
const AppError = require('./../util/appError');

//create new list 
exports.createList = catchAsync(async(req , res , next) => {
    const {name , tourId} = req.body;
    const user = req.user;
    // console.log(user._id)
    const newList = await Faviorate.create({
        name,
        user: user._id
    })

    if(tourId){
    newList.tours.push(tourId);
    await newList.save();
    }

    res.status(200).json({
        status: 'success',
        list: newList
    })
})

//add tour or rename list
exports.UpdateList = catchAsync(async(req ,res , next) =>{
    const {tourId , newName} = req.body;
    const list = await Faviorate.findById(req.params.listId);

    if (!list) {
        return next(new AppError('list Is Not Found!', 404));
    }

    if(tourId){ 
        list.tours.push(tourId); 
        // await list.save();
        // const tour = await Tour.findById(tourId);
        // tour.faviorate = true;
        // await tour.save();
    }
    if(newName){ 
        list.name = newName;
        // await list.save();
     }

    await list.save();


    res.status(200).json({
        status: 'success',
        list
    })
})

//delete list
exports.deleteList = catchAsync(async(req , res , next) =>{
    const list = await Faviorate.findByIdAndDelete(req.params.listId);
    
    if(!list){
        return next(new AppError('List is not found!' , 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'List Deleted!'
    })
})

//get user's lists (for one user)
exports.getUserLists = catchAsync(async(req , res , next) =>{
    const user = req.user;
    const lists = await Faviorate.find({user});

    res.status(200).json({
        status: 'success',
        results: lists.length,
        data: {
            lists
        }
    })
})

//get all users lists (for admin)
exports.getAllLists = catchAsync(async(req , res , next) =>{
    const lists = await Faviorate.find(req.query).populate('tours');

    res.status(200).json({
        status: 'success',
        results: lists.length,
        data: {
            lists
        }
    })
})

//get list
exports.getList = catchAsync(async(req , res , next) =>{
    const list = await Faviorate.findById(req.params.listId);

    if(!list){
        return next(new AppError('List is not found!' , 404));
    }

    res.status(200).json({
        status: 'success',
        list
    })
})

//delete tour from list
exports.deleteTourList = catchAsync(async(req , res , next) =>{
    const list = await Faviorate.findById(req.params.listId);
    const tourId = req.body;
    const tourIndex = list.tours.indexOf(tourId.tourId);

    list.tours.splice(tourIndex , 1);
    await list.save();

    res.status(200).json({
        status: 'list deleted successfully!',
        list
    })
})