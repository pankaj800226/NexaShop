const routes = express.Router()
import express from 'express';
import multer from 'multer'
import Path from 'path'
import { isAuthenticated } from '../authorize/isAuth.js'
import { Product } from '../models/product.model.js'
import { Cart } from '../models/cart.model.js'
import { Order } from '../models/order.model.js';
import { Rating } from '../models/rating.model.js';
// import NodeCache from 'node-cache';

// const nodeCache = new NodeCache()

// all product logic functions are defined
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/photo')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + Path.extname(file.originalname))
    }
})


const upload = multer({ storage: storage })
routes.post('/uploadProduct', upload.array('files', 8), isAuthenticated, async (req, res) => {
    try {
        const { productName,
            price,
            stock,
            categories,
            discountPrice,
            dressSizes,
            dressColor,
        }
            = req.body;
        const userId = req.userId;

        if (!req.files || req.files.length === 0) {
            return res.status(404).json({ error: "No files uploaded" });
        }

        const photos = req.files.map((file) => file.filename); // Array of filenames

        const product = await Product.create({
            photo: photos,
            productName,
            price,
            discountPrice,
            stock,
            categories,
            dressSizes,
            dressColor,
            userId,
        });

        // nodeCache.del('products')
        // Clear or update the cache after creating a new product

        res.json(product);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' });
    }
});



// find all products
routes.get('/productFind', async (req, res) => {
    try {

        // let products;
        const products = await Product.find().sort({ createdAt: -1 })
        // if (nodeCache.has('products')) {
        //     products = nodeCache.get('products');
        // } else {

        //     nodeCache.set('products', products)
        // }

        if (!products) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.json(products)


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

// product find one by one id through
routes.post('/productFindById/:id', async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.json(product)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

//edit product
routes.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { productName, price, stock, categories, discountPrice, dressSizes, dressColor } = req.body

        const product = await Product.findByIdAndUpdate(id, {
            productName: productName,
            price: price,
            stock: stock,
            categories: categories,
            dressSizes: dressSizes,
            discountPrice: discountPrice,
            dressColor: dressColor,


        })

        // nodeCache.del('products')

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }


        res.json(product)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})

//delete product
routes.delete('/productDelete/:id', async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // nodeCache.del('products')
        res.json(product)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })

    }
})


// 💖💖💖💖💖💖💖💖💖💖💖💖💖AD TO CART FUN💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖💖
routes.post('/addToCart', isAuthenticated, async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;
        const userId = req.userId

        let cart = await Cart.findOne({ userId })

        if (cart) {
            // If cart exists, update the quantity if the product is already in the cart
            const itemIndex = cart.items.findIndex((item) => item.productId == productId && item.size == size && item.color == color);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity
            } else {
                cart.items.push({ productId, quantity, size, color })
            }
        } else {
            // If no cart, create a new one
            cart = new Cart({
                userId,
                items: [{ productId, quantity, size, color }],

            })

        }
        await cart.save();
        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' })
    }
})

// cart get 
routes.post('/getCart', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId

        const cart = await Cart.findOne({ userId }).populate('items.productId')

        if (!cart) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.json(cart)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'ERROR' });
    }
})

// increment the cart
routes.put('/incrementItem/:itemId', isAuthenticated, async (req, res) => {

    try {
        const { itemId } = req.params;
        const userId = req.userId

        const cart = await Cart.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1
            await cart.save();
            return res.status(200).json({ message: "Item quantity incremented successfully" });

        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to remove item" });
    }
})

// decrement quantity
routes.put('/decrementItem/:itemId', isAuthenticated, async (req, res) => {

    try {
        const { itemId } = req.params;
        const userId = req.userId

        const cart = await Cart.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId)
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                // If quantity is 1, you might want to remove the item
                cart.items.slice(itemIndex, 1)
            }

            await cart.save()
            return res.status(200).json({ message: "Item quantity decremented", cart });
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to remove item" });
    }
})

// remove a product from the cart
routes.delete('/cart/removeItem/:itemId', isAuthenticated, async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.userId;

        const cart = await Cart.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Remove the item from the cart
        cart.items = cart.items.filter((item) => item._id.toString() !== itemId)
        await cart.save();
        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to remove item" });
    }
});

// ***********************************Rating product********************************
routes.post('/rating/comment/:productId', isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId
        const { comment, rating } = req.body;

        // create a new feedback & rating & comment
        const newRating = new Rating({ productId, userId, comment, rating })
        await newRating.save();

        res.status(201).json({ message: 'rating added successfully', newComment: newRating });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to remove item" });
    }
})

//rating find 
routes.get('/ratingGet/:productId', async (req, res) => {
    try {
        const { productId } = req.params

        const rating = await Rating.find({ productId })
            .populate('userId', 'username profileImg')
            .sort({ createdAt: -1 });

        if (!rating) {
            return res.status(404).json({ message: "rating not found" })
        }

        res.json(rating)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed" });

    }
})

// delete rating
routes.delete('/rating/delete/:productId', isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.params
        const userId = req.userId

        const rating = await Rating.findById(productId)

        if (!rating) {
            return res.status(404).send({ message: "rating not found" })
        }

        if (rating.userId.toString() !== userId) {
            return res.status(404).send({ message: "Anauthorized user" })

        }

        await Rating.findByIdAndDelete(productId)

        return res.status(200).send({ message: "rating removed successfully" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed" });

    }
})






// ***********************************place order*********************************
// order placed
routes.post('/placeOrder', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const { shippingDetails } = req.body;

        // Find the user's cart
        const cart = await Cart.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate('items.productId');


        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: "Cart is empty" });
        }

        // Create a new order
        const newOrder = new Order({
            userId,
            items: cart.items,
            shippingDetails,
            status: 'Confirmed',
        });


        await newOrder.save();

        // Clear the user's cart after placing the order
        await Cart.findOneAndDelete({ userId });

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder,
        });
    } catch (error) {
        console.error("Error placing order:", error.message); // Log error message
        return res.status(500).json({ message: "Failed to place order", error: error.message });
    }
});

// order find
routes.get('/orderGet', isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId

        const order = await Order.find({ userId }).populate('items.productId');

        if (!order) {
            return res.status(404).json({ message: "order not found" });
        }

        res.json(order);
    } catch (error) {
        console.log(error);

    }
})

// all user product find out
routes.get('/allOrder', async (req, res) => {
    try {

        const order = await Order.find().populate('items.productId');

        if (!order) {
            return res.status(404).json({ message: "order not found" });
        }

        res.json(order);
    } catch (error) {
        console.log(error);

    }
})

routes.put('/orderStatus/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const orderStatus = await Order.findByIdAndUpdate(id, { status }, { new: true })

        if (!orderStatus) {
            return res.status(404).json({ message: 'Order not found' });

        }

        res.json(orderStatus)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error' })

    }
})

// order delete
routes.delete('/orderDelete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id)

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        res.json(order)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error' })

    }
})

export default routes