const dotenv = require('dotenv');
const result = dotenv.config();
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentsRoutes');  // Import comment routes
const complaintRoutes = require('./routes/complaintsRoutes');  // Import complaint routes
const buyListingRoutes = require('./routes/buyListingRoutes');  // Import buy listing routes

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);  // Add comment routes
app.use('/api/complaints', complaintRoutes);  // Add complaint routes
app.use('/api/buy', buyListingRoutes);  // Add buy listing routes

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });
