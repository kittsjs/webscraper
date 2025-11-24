/**
 * Libas image extraction
 */

/**
 * Extracts product image from Libas
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractLibasImages(page) {
  try {
    // First find element with data-product-image-main, then image-element, then img tag
    const imageUrl = await page.evaluate(() => {
      // Find element with data-product-image-main attribute
      const productImageMain = document.querySelector('[data-product-image-main]');
      
      if (productImageMain) {
        // Find image-element within data-product-image-main
        const imageElement = productImageMain.querySelector('image-element');
        
        if (imageElement) {
          // Find img tag within the image-element
          const img = imageElement.querySelector('img');
          
          if (img) {
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
      }
      
      return null;
    });

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Libas image:', error.message);
    return null;
  }
}

