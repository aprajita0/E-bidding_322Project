const dotenv = require('dotenv');
const result = dotenv.config();
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const superuserRoutes = require('./routes/superuserRoutes');
const reguserRoutes = require('./routes/reguserRoutes');

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/users', superuserRoutes);
app.use('/api/users', reguserRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(5001, () => {
    console.log('Server is running on port 4000');
});

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log(error);
    });


console.log('User routes loaded');
