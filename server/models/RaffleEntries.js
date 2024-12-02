const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleEntriesScheme = new Schema({
    raffle_id: { type: Schema.Types.ObjectId, ref: 'Raffle', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    won_prize: { type: Boolean, default: false },
    won_date: { type: Date },
});
  
const RaffleEntries = mongoose.model('RaffleEntries', raffleEntriesScheme);
module.exports = RaffleEntries;