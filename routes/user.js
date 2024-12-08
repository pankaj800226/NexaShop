import express from 'express';
const routes = express.Router()
import { User } from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Path from 'path'
import multer from 'multer';
import { isAuthenticated } from '../authorize/isAuth.js';

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profileImg')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + Path.extname(file.originalname))
    }
})


const upload1 = multer({ storage: storage1 })

routes.post('/register', upload1.single('file'), async (req, res) => {
    try {
        const { username, password, email } = req.body

        if (!req.file) {
            return res.status(404).json({ error: "No file uploaded" });

        }

        const { filename } = req.file

        const existing = await User.findOne({ email })

        if (existing) {
            return res.send({ code: 409, message: " user already exists" });

        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            profileImg: filename,
            username,
            email,
            password: hashPassword,
        })

        await newUser.save()
        res.send({ code: 200, message: "Signup successful" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

//signup
routes.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.send({ code: 404, message: "User not found" });

        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.send({ code: 401, message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '2d'
        })


        res.send({
            userId: user._id,
            profileImg: user.profileImg,
            username: user.username,
            email: user.email,
            code: 200,
            token,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

// login
routes.post('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).select('-password')


        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            userId: user._id,
            username: user.username,
            email: user.email,
            profileImg: user.profileImg,

        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })
    }
})

// all users
routes.get('/allUser', async (req, res) => {
    try {
        const user = await User.find()

        if (!user) {
            return res.status(404).json({ message: 'user not found' })

        }

        res.json(user)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

export default routes
