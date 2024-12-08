import mongoose from 'mongoose'

const feedbackSchems = new mongoose.Schema({
    feedbackComment: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

}, { timestamps: true })

export const Feedback = mongoose.model('Feedback', feedbackSchems)