import express from 'express';
import scraperController from '../controllers/scraperController.js';

const router = express.Router();

/**
 * GET /api/extract-images?url=<ecommerce-url>
 * Extracts product images from the given e-commerce URL
 */
router.get('/extract-images', scraperController.extractImages.bind(scraperController));

export default router;
