require('dotenv').config({ path: './server/.env' });
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});

mongoose.connect("mongodb+srv://admin:1234@e-biddingdb.kjq3q.mongodb.net/?retryWrites=true&w=majority&appName=e-biddingDB")
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });

