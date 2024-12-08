import express from 'express';
const routes = express.Router()
import { GoogleGenerativeAI } from '@google/generative-ai'

routes.post('/getResponse', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(req.body.question);

        // if (!genAI) {
        //     return res.status(404).json({ message: "not Found" })
        // }
        // console.log(result.response.text());

        res.status(200).json({
            response: result.response.text()
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })

    }
})

export default routes
