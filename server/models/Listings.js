const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, maxlength: 250, required: true },
    description: { type: String },
    type: { type: String, maxlength: 50 },
    price_from: { type: mongoose.Types.Decimal128, required: true },
    price_to: { type: mongoose.Types.Decimal128, required: true },
    status: { type: String, enum: ['available', 'sold'], default: 'available' }, // added status
    date_listed: { type: Date, default: Date.now }
  
  });
  
  const Listing = mongoose.model('Listing', listingSchema);
  module.exports = Listing;
  