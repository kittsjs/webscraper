/**
 * Site-specific image extraction functions
 * Each function extracts product images from a specific e-commerce site
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

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Amazon image:', error.message);
    return null;
  }
}

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

    return imageUrl;
  } catch (error) {
    console.error('Error extracting Souled Store image:', error.message);
    return null;
  }
}

/**
 * Extracts product image from Ajio
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
/**
 * Extracts product image from H&M
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractHmImages(page) {
  try {
    // Get page content to see what's actually loaded
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        readyState: document.readyState,
        bodyHTML: document.body ? document.body.innerHTML.substring(0, 2000) : 'No body',
        hasGridGallery: !!document.querySelector('[data-testid="grid-gallery"]')
      };
    });
    
    console.log('H&M Page Info:', JSON.stringify(pageInfo, null, 2));
    
    // Find element with data-testid="grid-gallery", then first li, then img
    const imageUrl = await page.evaluate(() => {
      const gridGallery = document.querySelector('[data-testid="grid-gallery"]');
      
      if (gridGallery) {
        // Find the first li element within grid-gallery
        const firstLi = gridGallery.querySelector('li');
        
        if (firstLi) {
          // Find img tag within the first li
          const img = firstLi.querySelector('img');
          
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
    console.error('Error extracting H&M image:', error.message);
    return null;
  }
}

export async function extractAjioImages(page) {
  try {
    // Wait for the myCarousel element to appear (it might be dynamically loaded)
    console.log('Waiting for myCarousel element to appear...');
    
    try {
      await page.waitForSelector('#myCarousel', { 
        timeout: 15000,
        visible: false 
      });
      console.log('myCarousel element found and loaded!');
    } catch (waitError) {
      console.log('myCarousel not found after waiting:', waitError.message);
      
      // Check if page loaded successfully
      const pageInfo = await page.evaluate(() => {
        return {
          readyState: document.readyState,
          title: document.title,
          url: window.location.href,
          bodyChildren: document.body ? document.body.children.length : 0
        };
      });
      
      console.log('Page info:', pageInfo);
      
      // Try waiting a bit more
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Find element with id 'myCarousel' - checking if it's being read
    const result = await page.evaluate(() => {
      const carousel = document.getElementById('myCarousel');
      console.log('myCarousel element found:', !!carousel);
      
      if (carousel) {
        return {
          found: true,
          tagName: carousel.tagName,
          id: carousel.id,
          className: carousel.className,
          innerHTMLLength: carousel.innerHTML ? carousel.innerHTML.length : 0
        };
      }
      
      // Debug: Check what elements exist
      const allElementsWithId = Array.from(document.querySelectorAll('[id]')).map(el => el.id).slice(0, 20);
      const carouselRelated = Array.from(document.querySelectorAll('[id*="carousel"], [class*="carousel"], [id*="Carousel"], [class*="Carousel"]')).slice(0, 10);
      
      return {
        found: false,
        allIds: allElementsWithId,
        carouselRelated: carouselRelated.map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className
        }))
      };
    });

    console.log('Ajio carousel check result:', JSON.stringify(result, null, 2));
    
    // Return null for now - just checking if element is found
    return null;
  } catch (error) {
    console.error('Error extracting Ajio image:', error.message);
    console.error('Error stack:', error.stack);
    return null;
  }
}





