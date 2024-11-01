const mongoose = require('mongoose');
const { Schema } = mongoose;

const bidSchema = new Schema({
    listing_id: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    bidder_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: mongoose.Types.Decimal128, required: true},
    date_bid: { type: Date, default: Date.now },
    bid_expiration: { type: Date, required: true }
  });
  
  const Bid = mongoose.model('Bid', bidSchema);
  module.exports = Bid;
  