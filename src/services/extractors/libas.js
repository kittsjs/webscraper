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

    const imageList = await extractLibasGalleryImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Libas image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

/**
 * Extracts all product images from Libas product image elements
 * @param {object} page - Puppeteer page object
 * @returns {Promise<Array<string>>} Array of image URLs
 */
async function extractLibasGalleryImages(page) {
  try {
    return await page.evaluate(() => {
      const productImageMains = document.querySelectorAll('[data-product-image-main]');
      
      if (!productImageMains || productImageMains.length === 0) {
        return [];
      }

      const imageList = [];
      
      productImageMains.forEach(productImageMain => {
        // Find all image-element tags within each data-product-image-main
        const imageElements = productImageMain.querySelectorAll('image-element');
        
        imageElements.forEach(imageElement => {
          // Find img tag within each image-element
          const img = imageElement.querySelector('img');
          
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
      });

      return imageList;
    });
  } catch (error) {
    console.error('Error extracting Libas gallery images:', error.message);
    return [];
  }
}

