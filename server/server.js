require('dotenv').config({ path: './server/.env' });
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);

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

