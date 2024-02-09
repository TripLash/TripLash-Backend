require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const {connect_db} = require('./util/db');
const globalErrorHandler = require('./Controllers/errorController');
const userRouter = require('./Routs/userRout');

app.use(cors())
connect_db()
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(globalErrorHandler);
app.use('/api/', userRouter);


const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
})