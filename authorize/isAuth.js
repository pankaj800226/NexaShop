import jwt from 'jsonwebtoken'

export const isAuthenticated = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const isVeryfy = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.userId = isVeryfy.userId
        next();

    } catch (error) {
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please log in again' });

        }

        return res.status(400).json({ message: 'Invalid token' });

    }
}   