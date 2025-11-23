import scraperService from '../services/scraperService.js';

class ScraperController {
  /**
   * Handle image extraction request
   */
  async extractImages(req, res) {
    try {
      let { url } = req.query;

      console.log('url', url);
      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL parameter is required'
        });
      }

      // Decode the URL if it's encoded
      try {
        url = decodeURIComponent(url);
        console.log('Decoded URL:', url);
      } catch (decodeError) {
        // If decoding fails, try with decodeURI (less strict)
        try {
          url = decodeURI(url);
          console.log('Decoded URL (less strict):', url);
        } catch (e) {
          // If both fail, use original URL
          console.log('URL decoding failed, using original URL');
        }
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

      const imageUrl = await scraperService.extractProductImages(url);

      res.json({
        success: true,
        url: url,
        image: imageUrl
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
