/**
 * Saadaa image extraction
 * Uses Saadaa API instead of scraping
 */

/**
 * Extracts product image from Saadaa
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Saadaa product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractSaadaaImages(page, url) {
  try {
    // Import Saadaa API service dynamically to avoid circular dependencies
    const { default: saadaaApiService } = await import('../api/saadaaApi.js');
    
    // Get product image from Saadaa API
    const imageUrl = await saadaaApiService.getProductImage(url);
    
    return imageUrl;
  } catch (error) {
    console.error('Error extracting Saadaa image:', error.message);
    return null;
  }
}

