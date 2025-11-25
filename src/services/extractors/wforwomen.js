/**
 * Wforwomen image extraction
 * Uses Wforwomen API instead of scraping
 */

/**
 * Extracts product image from Wforwomen
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Wforwomen product page URL
 * @returns {Promise<Object>} Object with image and imageList properties
 */
export async function extractWforwomenImages(page, url) {
  try {
    // Import Wforwomen API service dynamically to avoid circular dependencies
    const { default: wforwomenApiService } = await import('../api/wforwomenApi.js');
    
    // Get product image and imageList from Wforwomen API
    const result = await wforwomenApiService.getProductImage(url);
    
    return result;
  } catch (error) {
    console.error('Error extracting Wforwomen image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

