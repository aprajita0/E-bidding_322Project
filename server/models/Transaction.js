const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
    buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing_id: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    amount: { type: mongoose.Types.Decimal128, required: true },
    transaction_date: { type: Date, default: Date.now }
  });
  
  const Transaction = mongoose.model('Transaction', transactionSchema);
  module.exports = Transaction;
  