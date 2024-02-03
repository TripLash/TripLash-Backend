require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const {connect_db} = require('./util/db');


connect_db()
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const port = 3000;
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
})