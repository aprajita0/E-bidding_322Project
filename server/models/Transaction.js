const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    seller_id: { type: Schema.Types.ObjectId, ref: 'User'},
    listing_id: { type: Schema.Types.ObjectId, ref: 'Listing'},
    amount: { type: mongoose.Types.Decimal128, required: true },
    transaction_date: { type: Date, default: Date.now },
    buyer_rating_given: { type: Boolean, default: false },
    seller_rating_given: { type: Boolean, default: false },
  });
  
  const Transaction = mongoose.model('Transaction', transactionSchema);
  module.exports = Transaction;
  
