require('dotenv').config({ path: './server/.env' });
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Role = require('./models/Role');
const User = require('./models/User');
const SuperUser = require('./models/SuperUser');
const Visitor = require('./models/Visitor');
const Listing = require('./models/Listings'); 
console.log('Mongo URI:', process.env.MONGO_URI);


app.get('/', (req, res) => {
  res.send('Hello World');
})

app.listen(4000, () => {
  console.log('Server is running on port 4000');
})


mongoose.
connect(uri)
.then(() => {
  console.log('Connected to MongoDB');
  createDummyListings();
}).catch((error)=>{
  console.log(error)
})


