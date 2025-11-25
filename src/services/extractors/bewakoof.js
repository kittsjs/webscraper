/**
 * Bewakoof image extraction
 * Uses hybrid approach: scrapes page to get build ID, then calls API
 */

/**
 * Extracts product handle from URL (everything after /p/)
 * @param {string} url - Product page URL
 * @returns {string|null} Product handle or null if not found
 */
function extractProductHandle(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract product handle from pathname like "/p/mens-white-blue-striped-oversized-sweater"
    const match = pathname.match(/\/p\/(.+)/);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting product handle from URL:', error.message);
    return null;
  }
}

/**
 * Extracts build ID from buildManifest script tag
 * @param {object} page - Puppeteer page object
 * @returns {Promise<string|null>} Build ID or null if not found
 */
async function extractBuildId(page) {
  try {
    const buildId = await page.evaluate(() => {
      // Find script tag with src containing buildManifest.js
      const scripts = document.querySelectorAll('script[src*="buildManifest.js"]');
      
      if (scripts && scripts.length > 0) {
        // Get the first script tag
        const script = scripts[0];
        const src = script.getAttribute('src');
        
        if (src) {
          // Extract content between /static/ and /buildManifest.js
          // Example: /_next/static/f6d1_TfHB8j4VdZJd_gCR/_buildManifest.js
          const match = src.match(/\/static\/([^\/]+)\/.*?buildManifest\.js/);
          
          if (match && match[1]) {
            return match[1];
          }
        }
      }
      
      return null;
    });
    
    return buildId;
  } catch (error) {
    console.error('Error extracting build ID:', error.message);
    return null;
  }
}

/**
 * Constructs API URL for Bewakoof
 * @param {string} productHandle - Product handle extracted from URL
 * @param {string} buildId - Build ID extracted from script tag
 * @returns {string} API URL
 */
function constructApiUrl(productHandle, buildId) {
  return `https://www.bewakoof.com/_next/data/${buildId}/p/${productHandle}.json?product_handle=${productHandle}`;
}

/**
 * Fetches product data from Bewakoof API
 * @param {string} apiUrl - API URL
 * @returns {Promise<Object|null>} Product data or null if failed
 */
async function fetchProductData(apiUrl) {
  try {
    console.log('Fetching Bewakoof product from API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Bewakoof API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product from Bewakoof API:', error.message);
    return null;
  }
}

/**
 * Extracts product image from API response
 * @param {Object} apiResponse - API response object
 * @returns {string|null} Product image URL or null if not found
 */
function extractProductImage(apiResponse) {
  try {
    if (apiResponse && 
        apiResponse.pageProps && 
        apiResponse.pageProps.productDetails && 
        apiResponse.pageProps.productDetails.meta_image) {
      return apiResponse.pageProps.productDetails.meta_image;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting product image from API response:', error.message);
    return null;
  }
}

/**
 * Extracts product gallery images from API response
 * @param {Object} apiResponse - API response object
 * @returns {Array<string>} Array of image URLs
 */
function extractBewakoofGalleryImages(apiResponse) {
  try {
    if (!apiResponse || 
        !apiResponse.pageProps || 
        !apiResponse.pageProps.productDetails || 
        !apiResponse.pageProps.productDetails.images || 
        !apiResponse.pageProps.productDetails.images.additional) {
      return [];
    }

    const additional = apiResponse.pageProps.productDetails.images.additional;
    
    if (!Array.isArray(additional)) {
      return [];
    }

    const imageList = additional
      .map(item => {
        if (item && item.name && typeof item.name === 'string') {
          return `https://images.bewakoof.com/original/${item.name}`;
        }
        return null;
      })
      .filter(url => url !== null);

    return imageList;
  } catch (error) {
    console.error('Error extracting Bewakoof gallery images from API response:', error.message);
    return [];
  }
}

/**
 * Extracts product image from Bewakoof
 * @param {object} page - Puppeteer page object
 * @param {string} url - Bewakoof product page URL
 * @returns {Promise<string|null>} Single image URL or null if not found
 */
export async function extractBewakoofImages(page, url) {
  try {
    // Extract product handle from URL
    const productHandle = extractProductHandle(url);
    
    if (!productHandle) {
      console.error('Could not extract product handle from URL:', url);
      return null;
    }
    
    console.log(`Extracted product handle: ${productHandle}`);
    
    // Extract build ID from the page (from buildManifest script tag)
    const buildId = await extractBuildId(page);
    
    if (!buildId) {
      console.error('Could not extract build ID from page');
      return null;
    }
    
    console.log(`Extracted build ID: ${buildId}`);
    
    // Construct API URL
    const apiUrl = constructApiUrl(productHandle, buildId);
    
    // Fetch product data from API
    const apiResponse = await fetchProductData(apiUrl);
    
    if (!apiResponse) {
      return {
        image: null,
        imageList: []
      };
    }
    
    // Extract image from response
    const imageUrl = extractProductImage(apiResponse);
    
    // Extract gallery images from response
    const imageList = extractBewakoofGalleryImages(apiResponse);
    
    return {
      image: imageUrl,
      imageList
    };
  } catch (error) {
    console.error('Error extracting Bewakoof image:', error.message);
    return {
      image: null,
      imageList: []
    };
  }
}

