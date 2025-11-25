/**
 * Souled Store image extraction
 */

/**
 * Extracts product image from Souled Store
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractSouledStoreImages(page) {
  try {
    // Find element with class 'mdproduct' and extract first nested image
    const imageUrl = await page.evaluate(() => {
      const mdProduct = document.querySelector('.mdproduct');
      
      if (mdProduct) {
        // Find all img tags nested within the mdproduct element
        const imgs = mdProduct.querySelectorAll('img');
        
        if (imgs && imgs.length > 0) {
          // Get the first image
          const img = imgs[0];
          
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

    const imageList = await extractSouledStoreGalleryImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Souled Store image:', error.message);
    return null;
  }
}

/**
 * Extracts all images nested under the mdproduct container
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string[]>} List of image URLs
 */
async function extractSouledStoreGalleryImages(page) {
  try {
    return await page.evaluate(() => {
      const mdProduct = document.querySelector('.mdproduct');
      if (!mdProduct) {
        return [];
      }

      const getRawSrc = (img) => (
        img.src ||
        img.getAttribute('data-src') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-url')
      );

      return Array.from(mdProduct.querySelectorAll('img'))
        .map(img => getRawSrc(img))
        .filter(Boolean)
        .map(src => {
          if (!src.startsWith('http')) {
            if (src.startsWith('//')) {
              return 'https:' + src;
            }
            if (src.startsWith('/')) {
              return window.location.origin + src;
            }
            return window.location.origin + '/' + src;
          }
          return src;
        });
    });
  } catch (error) {
    console.error('Error extracting Souled Store gallery images:', error.message);
    return [];
  }
}

