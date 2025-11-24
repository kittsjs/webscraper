/**
 * Flipkart image extraction
 */

/**
 * Extracts product image from Flipkart
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractFlipkartImages(page) {
  try {
    // Find img element with fetchpriority="high"
    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img[fetchpriority="high"]');
      
      if (img) {
        // Get src attribute
        const src = img.src || img.getAttribute('src');
        
        if (src && src.startsWith('http')) {
          return src;
        }
      }
      
      return null;
    });

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Flipkart image:', error.message);
    return null;
  }
}

