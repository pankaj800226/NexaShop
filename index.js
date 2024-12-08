import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import routes from './routes/app.js';
import airoutes from './routes/ai.js'
import userroutes from './routes/user.js'
import feedbackroute from './routes/feedback.js'
import wishlistroute from './routes/wishlist.js'

import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 8000
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use(routes);
app.use(airoutes)
app.use(userroutes)
app.use(feedbackroute)
app.use(wishlistroute)

try {
  mongoose.connect(process.env.MONGODB_URL);
  console.log('database connectioned');


} catch (error) {
  console.log('mongoose error');
}



app.listen(PORT, (console.log('Server listening on port ' + PORT)))
