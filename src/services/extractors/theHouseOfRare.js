/**
 * The House of Rare image extraction
 * Uses The House of Rare API instead of scraping
 */

/**
 * Extracts product image from The House of Rare
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - The House of Rare product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractTheHouseOfRareImages(page, url) {
  try {
    // Import The House of Rare API service dynamically to avoid circular dependencies
    const { default: theHouseOfRareApiService } = await import('../api/theHouseOfRareApi.js');
    
    // Get product image from The House of Rare API
    const imageUrl = await theHouseOfRareApiService.getProductImage(url);
    
    return imageUrl;
  } catch (error) {
    console.error('Error extracting The House of Rare image:', error.message);
    return null;
  }
}

