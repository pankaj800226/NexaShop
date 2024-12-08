import express from 'express';
const routes = express.Router()
import { Wishlist } from "../models/wishlist.model.js";
import { isAuthenticated } from '../authorize/isAuth.js';

// ***********************************WishList Logic*********************************
routes.post('/wishlist', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        // Find the user's wishlist by userId
        let wishlist = await Wishlist.findOne({ userId });

        let action;

        if (wishlist) {
            // Check if the product already exists in the wishlist
            const itemIndex = wishlist.items.findIndex((item) => item.productId.toString() === productId)

            if (itemIndex > -1) {
                // remove item from wishlist in array
                wishlist.items.splice(itemIndex, 1);
                action = 'removed';
            } else {
                // add item to wishlist in array
                wishlist.items.push({ productId })
                action = "added";
            }
        } else {
            // create a new Wishlist
            wishlist = new Wishlist({
                userId,
                items: [{ productId }]
            })
            action = "added";

        }
        await wishlist.save();
        return res.status(200).json({ message: "Wishlist updated successfully", wishlist, action });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed" });

    }
})


// get wishlist
routes.post('/wishlistGet', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId
        const wishlist = await Wishlist.findOne({ userId }).populate('items.productId')

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" })
        }

        res.json(wishlist)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed" });

    }
})



export default routes