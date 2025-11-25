/**
 * Amazon image extraction
 */

/**
 * Extracts product image from Amazon
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractAmazonImages(page) {
  try {
    // Find element with data-csa-c-action="image-block-main-image-hover"
    const imageUrl = await page.evaluate(() => {
      const imageBlock = document.querySelector('[data-csa-c-action="image-block-main-image-hover"]');
      
      if (imageBlock) {
        // Find img tag within this element
        const img = imageBlock.querySelector('img');
        
        if (img) {
          // Try to get src, data-src, or data-lazy-src
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          
          if (src && src.startsWith('http')) {
            return src;
          }
        }
      }
      
      return null;
    });

    const imageList = await extractAmazonThumbnailImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Amazon image:', error.message);
    return null;
  }
}

/**
 * Extracts list of thumbnail images from Amazon gallery
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string[]>} List of image URLs
 */
async function extractAmazonThumbnailImages(page) {
  try {
    return await page.evaluate(() => {
      const thumbnails = Array.from(document.querySelectorAll('.imageThumbnail img'));
      return thumbnails
        .map(img => img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src'))
        .filter(src => typeof src === 'string' && src.startsWith('http'));
    });
  } catch (error) {
    console.error('Error extracting Amazon thumbnail images:', error.message);
    return [];
  }
}

