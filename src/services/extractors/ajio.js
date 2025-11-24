/**
 * Ajio image extraction
 * Uses Ajio API instead of scraping due to bot detection
 */

/**
 * Extracts product image from Ajio
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Ajio product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractAjioImages(page, url) {
  try {
    // Import Ajio API service dynamically to avoid circular dependencies
    const { default: ajioApiService } = await import('../api/ajioApi.js');
    
    // Get product image from Ajio API
    const imageUrl = await ajioApiService.getProductImage(url);
    
    return imageUrl;
  } catch (error) {
    console.error('Error extracting Ajio image:', error.message);
    return null;
  }
}

