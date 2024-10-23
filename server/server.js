require('dotenv').config();
require('dotenv').config({path: './server/.env'});
const uri = process.env.MONGO_URI;
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Role = require('./models/Role');
const User = require('./models/User');


app.get('/', (req, res) => {
  res.send('Hello World');
})

app.listen(4000, () => {
  console.log('Server is running on port 4000');
})
/*
const createRole = async () => {
  try {
    const newRole = new Role({ role_name: 'reguser' });
    await newRole.save();
    console.log('Role created:', newRole);
  } catch (error) {
    console.error('Error creating role:', error);
  }
};

const newUser = async () => { 
  try{
    const newUser = new User({
      first_name: 'John',
      last_name: 'Doe',
      username: 'john_doe',
      password: 'password123',  
      email: 'john@example.com',
      address_line_1: '123 Main St',
      address_line_2: 'Apt 4B',
      role_id: new mongoose.Types.ObjectId('6718502fbe1655759c849cb9'),  // This is the _id of the 'reguser' role
      account_balance: 100.00,
      suspension_count: 0,
      account_status: true
      });
    await newUser.save();
    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating User:', error);
  }
};

*/

mongoose.
connect(uri)
.then(() => {
  console.log('Connected to MongoDB');
  //newUser();
}).catch((error)=>{
  console.log(error)
})


