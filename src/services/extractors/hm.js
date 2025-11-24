/**
 * H&M image extraction
 * Uses H&M API instead of scraping due to bot detection
 */

/**
 * Extracts product image from H&M
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - H&M product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractHmImages(page, url) {
  try {
    // Import H&M API service dynamically to avoid circular dependencies
    const { default: hmApiService } = await import('../api/hmApi.js');
    
    // Get product image from H&M API
    const imageUrl = await hmApiService.getProductImage(url);
    
    return imageUrl;
  } catch (error) {
    console.error('Error extracting H&M image:', error.message);
    return null;
  }
}

