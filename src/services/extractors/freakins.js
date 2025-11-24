/**
 * Freakins image extraction
 * Uses Freakins API instead of scraping
 */

/**
 * Extracts product image from Freakins
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Freakins product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractFreakinsImages(page, url) {
  try {
    // Import Freakins API service dynamically to avoid circular dependencies
    const { default: freakinsApiService } = await import('../api/freakinsApi.js');
    
    // Get product image from Freakins API
    const imageUrl = await freakinsApiService.getProductImage(url);
    
    return imageUrl;
  } catch (error) {
    console.error('Error extracting Freakins image:', error.message);
    return null;
  }
}

