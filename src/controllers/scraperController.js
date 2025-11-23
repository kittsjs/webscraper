import scraperService from '../services/scraperService.js';

class ScraperController {
  /**
   * Handle image extraction request
   */
  async extractImages(req, res) {
    try {
      const { url } = req.query;

      console.log('url', url);
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL parameter is required'
        });
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        });
      }

      const images = await scraperService.extractProductImages(url);

      res.json({
        success: true,
        url: url,
        imageCount: images.length,
        images: images
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new ScraperController();
