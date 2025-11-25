/**
 * House of Chikankari image extraction
 * Uses House of Chikankari API instead of scraping
 */

/**
 * Extracts product image from House of Chikankari
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - House of Chikankari product page URL
 * @returns {Promise<Object>} Object with image and imageList properties
 */
export async function extractHouseOfChikankariImages(page, url) {
  try {
    // Import House of Chikankari API service dynamically to avoid circular dependencies
    const { default: houseOfChikankariApiService } = await import('../api/houseOfChikankariApi.js');
    
    // Get product image and imageList from House of Chikankari API
    const result = await houseOfChikankariApiService.getProductImage(url);
    
    return result;
  } catch (error) {
    console.error('Error extracting House of Chikankari image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

