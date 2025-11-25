/**
 * Saadaa image extraction
 * Uses Saadaa API instead of scraping
 */

/**
 * Extracts product image from Saadaa
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Saadaa product page URL
 * @returns {Promise<Object>} Object with image and imageList properties
 */
export async function extractSaadaaImages(page, url) {
  try {
    // Import Saadaa API service dynamically to avoid circular dependencies
    const { default: saadaaApiService } = await import('../api/saadaaApi.js');
    
    // Get product image and imageList from Saadaa API
    const result = await saadaaApiService.getProductImage(url);
    
    return result;
  } catch (error) {
    console.error('Error extracting Saadaa image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

