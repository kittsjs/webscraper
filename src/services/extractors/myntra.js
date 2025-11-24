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

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Myntra image:', error.message);
    return null;
  }
}

