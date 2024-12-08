import express from 'express'
import { isAuthenticated } from '../authorize/isAuth.js'
import { Feedback } from '../models/feedback.model.js'

const routes = express.Router()


routes.post('/feedback', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId
        const { feedbackComment } = req.body

        const feedback = await Feedback.create({
            feedbackComment,
            userId

        })

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" })
        }

        res.json(feedback)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })

    }
})

routes.get('/feedbackGet', async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('userId');

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" })
        }

        res.json(feedback)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })

    }

})


routes.delete('/feedbackDelete/:id', async (req, res) => {
    try {
        const { id } = req.params
        const feedback = await Feedback.findByIdAndDelete(id)

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" })
        }

        res.json(feedback)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })

    }
})


export default routes