const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    content: String,
    author:  { 
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })
const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    image: String,
    seller: { 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [commentSchema],
}, { timeseries: true })

module.exports = mongoose.model('Listing', listingSchema);