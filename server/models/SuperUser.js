const mongoose = require('mongoose');
const { Schema } = mongoose;

const superUserSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approved_users: { type: Number, default: 0 },
    suspensions_count: { type: Number, default: 0 },
    complaints_resolved: { type: Number, default: 0 },
  });
  
  const SuperUser = mongoose.model('SuperUser', superUserSchema);
  module.exports = SuperUser;
  