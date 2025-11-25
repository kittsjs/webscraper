/**
 * Aachho image extraction
 * Uses Aachho API instead of scraping
 */

/**
 * Extracts product image from Aachho
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Aachho product page URL
 * @returns {Promise<Object>} Object with image and imageList properties
 */
export async function extractAachhoImages(page, url) {
  try {
    // Import Aachho API service dynamically to avoid circular dependencies
    const { default: aachhoApiService } = await import('../api/aachhoApi.js');
    
    // Get product image and imageList from Aachho API
    const result = await aachhoApiService.getProductImage(url);
    
    return result;
  } catch (error) {
    console.error('Error extracting Aachho image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

