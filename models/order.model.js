import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            size: {
                type: String,
                required: true,
            },

            color: {
                type: String,
                required: true,
            }
        },
    ],
    shippingDetails: {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        nearHouse: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        pincode: {
            type: String,
            required: true,
        },
    },

    status: {
        type: String,
        enum: ['Confirmed', 'Shipping', 'Out for Delivery', 'Canceled',],
        default: 'Confirmed',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
