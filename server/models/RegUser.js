const mongoose = require('mongoose');
const { Schema } = mongoose;

const regularUserSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    transaction_count: { type: Number, default: 0 },
    total_spent: { type: mongoose.Types.Decimal128, default: 0 },
    complaints_count: { type: Number, default: 0 },
    vip: { type: Boolean, default: false },
    suspended: { type: Boolean, default: false },
  });
  
  const RegularUser = mongoose.model('RegularUser', regularUserSchema);
  module.exports = RegularUser;
  

 
