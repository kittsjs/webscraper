/**
 * Shoppers Stop image extraction
 */

/**
 * Extracts product image from Shoppers Stop
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractShoppersstopImages(page) {
  try {
    // Find img element with class "size-full object-contain" and loading="lazy"
    const imageUrl = await page.evaluate(() => {
      // Find all img elements with loading="lazy"
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      
      for (const img of lazyImages) {
        // Check if the img has classes "size-full" and "object-contain"
        const classList = img.classList;
        if (classList.contains('size-full') && classList.contains('object-contain')) {
          // Try to get src, data-src, or data-lazy-src
          let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
          
          // Handle relative URLs by converting to absolute
          if (src && !src.startsWith('http')) {
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = window.location.origin + src;
            } else {
              src = window.location.origin + '/' + src;
            }
          }
          
          if (src && src.startsWith('http')) {
            return src;
          }
        }
      }
      
      return null;
    });

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Shoppers Stop image:', error.message);
    return null;
  }
}

