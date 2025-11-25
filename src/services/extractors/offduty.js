/**
 * Offduty image extraction
 * Uses Offduty API instead of scraping
 */

/**
 * Extracts product image from Offduty
 * @param {object} page - Puppeteer page object (not used for API approach)
 * @param {string} url - Offduty product page URL
 * @returns {Promise<Object>} Object with image and imageList properties
 */
export async function extractOffdutyImages(page, url) {
  try {
    // Import Offduty API service dynamically to avoid circular dependencies
    const { default: offdutyApiService } = await import('../api/offdutyApi.js');
    
    // Get product image and imageList from Offduty API
    const result = await offdutyApiService.getProductImage(url);
    
    return result;
  } catch (error) {
    console.error('Error extracting Offduty image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

