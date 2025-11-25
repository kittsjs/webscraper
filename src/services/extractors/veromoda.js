/**
 * Veromoda image extraction
 */

/**
 * Extracts product image from Veromoda
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractVeromodaImages(page) {
  try {
    // Find element with data-media-type="image", then extract img tag within it
    const imageUrl = await page.evaluate(() => {
      // Find element with data-media-type="image"
      const mediaElement = document.querySelector('[data-media-type="image"]');
      
      if (mediaElement) {
        // Find img tag within this element
        const img = mediaElement.querySelector('img');
        
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
      
      return null;
    });

    const imageList = await extractVeromodaGalleryImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Veromoda image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

/**
 * Extracts all product images from Veromoda product gallery thumbnails
 * @param {object} page - Puppeteer page object
 * @returns {Promise<Array<string>>} Array of image URLs
 */
async function extractVeromodaGalleryImages(page) {
  try {
    return await page.evaluate(() => {
      const thumbnails = document.querySelectorAll('.product-gallery__thumbnail');
      
      if (!thumbnails || thumbnails.length === 0) {
        return [];
      }

      const imageList = [];
      
      thumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector('img');
        
        if (img) {
          const getRawSrc = (img) => (
            img.src ||
            img.getAttribute('data-src') ||
            img.getAttribute('data-lazy-src') ||
            img.getAttribute('data-original') ||
            img.getAttribute('data-url')
          );

          let src = getRawSrc(img);

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
            imageList.push(src);
          }
        }
      });

      return imageList;
    });
  } catch (error) {
    console.error('Error extracting Veromoda gallery images:', error.message);
    return [];
  }
}

