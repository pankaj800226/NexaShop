import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
        },

        discountPrice: {
            type: Number,
            required: true,
        },

        stock: {
            type: Number,
            required: true,
        },

        categories: {
            type: String,
            required: true,
            trim: true,
        },

        photo: {
            type: [String],
            required: true,
        },

        dressSizes: {
            type: [String],
            required: true,
        },


        dressColor: {
            type: [String],
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

    },
    { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
