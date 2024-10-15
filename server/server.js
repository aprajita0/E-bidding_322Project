require('dotenv').config();
require('dotenv').config({path: './server/.env'});
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const app = express();


app.get('/', (req, res) => {
  res.send('Hello World');
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})

mongoose.
connect(uri)
.then(() => {
  console.log('Connected to MongoDB');
}).catch((error)=>{
  console.log(error)
})