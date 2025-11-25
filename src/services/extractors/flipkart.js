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

    const imageList = await extractFlipkartThumbnailImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Flipkart image:', error.message);
    return null;
  }
}

/**
 * Extracts thumbnail images hosted on rukminim2.flixcart.com
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string[]>} List of image URLs
 */
async function extractFlipkartThumbnailImages(page) {
  const TARGET_PREFIX = 'https://rukminim2.flixcart.com/image/128/128/';

  try {
    return await page.evaluate((prefix) => {
      const images = Array.from(document.querySelectorAll('img'));

      return images
        .map(img => img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src'))
        .filter(src => typeof src === 'string' && src.startsWith(prefix));
    }, TARGET_PREFIX);
  } catch (error) {
    console.error('Error extracting Flipkart thumbnail images:', error.message);
    return [];
  }
}

