import express from 'express';
import { fetchProducts, fetchProductById, createPrintfulOrder } from '../controllers/printful.controller.js';

const router = express.Router();

// GET all products from the connected Printful Store
router.get('/products', fetchProducts);

// GET a single product by ID
router.get('/product/:id', fetchProductById);

// POST create a new Printful order
router.post('/order', createPrintfulOrder);

export default router;
