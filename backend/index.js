require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const router = require('./src/routes/UserRoute');
const cookieParser = require('cookie-parser');
const connectDB = require("./db/connectDB");
// express app
const app = express();

// middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to db
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log('connected to db & listening on port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    });

connectDB();

// routes
app.use('/api/user', router);

app.get('/', (req, res) => {
    res.json({message: "Health OK!"})
});

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
});

