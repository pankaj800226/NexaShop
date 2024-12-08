import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    comment: {
        type: String,
        required: true,
    },

    rating: {
        type: Number,
        required: true,
    },


    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Rating = mongoose.model('Rating', ratingSchema);

