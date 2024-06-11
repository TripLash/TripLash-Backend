require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const {connect_db} = require('./util/db');
const globalErrorHandler = require('./Controllers/errorController');
const userRouter = require('./Routs/userRout');
const tourRouter = require('./Routs/tourRout');
const guideRouter = require('./Routs/guideRouts');
const reviewRouter = require('./Routs/reviewRouts');
const faviorateRouter = require('./Routs/faviorateRouts');
const notificationRouter = require('./Routs/notificationRouts');
const applicatonRouter = require('./Routs/applicationRout');
const path = require('path');


app.use(cors())
connect_db()
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(globalErrorHandler);
app.use('/api/', userRouter);
app.use('/api/', tourRouter);
app.use('/api/', guideRouter);
app.use('/api/', reviewRouter);
app.use('/api/' , faviorateRouter)
app.use('/api/', notificationRouter);
app.use('/api' , applicatonRouter);

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
})