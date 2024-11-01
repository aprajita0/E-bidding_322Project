const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, maxlength: 250, required: true },
    description: { type: String },
    type: { type: String, maxlength: 50 },
    amount: { type: mongoose.Types.Decimal128, required: true },
    date_listed: { type: Date, default: Date.now }
  });
  
  const Listing = mongoose.model('Listing', listingSchema);
  module.exports = Listing;
  