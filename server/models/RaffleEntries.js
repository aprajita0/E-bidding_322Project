const mongoose = require('mongoose');
const { Schema } = mongoose;

const raffleEntriesScheme = new Schema({
    raffle_id: { type: Schema.Types.ObjectId, ref: 'Raffle', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    won_prize: { type: Date, required: true },
    won_date: { type: Date, required: true },
});
  
const RaffleEntries = mongoose.model('RaffleEntries', raffleEntriesScheme);
module.exports = RaffleEntries;