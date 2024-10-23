const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema({
 role_name: { type: String, enum: ['reguser', 'superuser', 'visitor'], required: true }
});

module.exports = mongoose.model('Role', roleSchema);