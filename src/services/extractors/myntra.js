/**
 * Myntra image extraction
 */

/**
 * Extracts product image from Myntra
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractMyntraImages(page) {
  try {
    // Find element with class 'image-grid-image' and extract background-image URL
    const imageUrl = await page.evaluate(() => {
      const imageGridElements = document.querySelectorAll('.image-grid-image');
      
      if (imageGridElements && imageGridElements.length > 0) {
        // Get the first element (div)
        const firstElement = imageGridElements[0];
        
        // Get the computed style or inline style
        const backgroundImage = window.getComputedStyle(firstElement).backgroundImage || firstElement.style.backgroundImage;
        
        if (backgroundImage && backgroundImage !== 'none') {
          // Extract URL from background-image: url("...") or url('...') or url(...)
          const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          
          if (urlMatch && urlMatch[1]) {
            let src = urlMatch[1];
            
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

    const imageList = await extractMyntraGalleryImages(page);

    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Myntra image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

/**
 * Extracts all product images from Myntra image grid container
 * @param {object} page - Puppeteer page object
 * @returns {Promise<Array<string>>} Array of image URLs
 */
async function extractMyntraGalleryImages(page) {
  try {
    await ensureMyntraGalleryImagesLoaded(page);
    return await page.evaluate(() => {
      const container = document.querySelector('.image-grid-container');
      if (!container) {
        return [];
      }

      const tiles = Array.from(container.querySelectorAll('.image-grid-image'));
      return tiles
        .map(tile => {
          const backgroundImage = window.getComputedStyle(tile).backgroundImage || tile.style.backgroundImage;
          if (!backgroundImage || backgroundImage === 'none') {
            return null;
          }

          const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (!urlMatch || !urlMatch[1]) {
            return null;
          }

          let src = urlMatch[1];
          if (!src.startsWith('http')) {
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = window.location.origin + src;
            } else {
              src = window.location.origin + '/' + src;
            }
          }

          return src.startsWith('http') ? src : null;
        })
        .filter(Boolean);
    });
  } catch (error) {
    console.error('Error extracting Myntra gallery images:', error.message);
    return [];
  }
}

/**
 * Scrolls through the Myntra gallery to force lazy-loaded tiles to render
 * @param {object} page - Puppeteer page object
 */
async function ensureMyntraGalleryImagesLoaded(page) {
  try {
    await page.evaluate(async () => {
      const container = document.querySelector('.image-grid-container');
      if (!container) {
        return;
      }

      const placeholders = Array.from(container.querySelectorAll('.lazyload-placeholder'));
      for (const placeholder of placeholders) {
        placeholder.scrollIntoView({ block: 'center' });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    });

    // Wait briefly for lazy placeholders to swap with real tiles
    await page.waitForFunction(() => {
      const container = document.querySelector('.image-grid-container');
      if (!container) {
        return true;
      }
      return container.querySelectorAll('.lazyload-placeholder').length === 0;
    }, { timeout: 2000 }).catch(() => {});
  } catch (error) {
    console.error('Error loading Myntra gallery images:', error.message);
  }
}

