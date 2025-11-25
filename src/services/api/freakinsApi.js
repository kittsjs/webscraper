/**
 * Freakins API Service
 * Handles API calls to Freakins product API
 */

class FreakinsApiService {
  /**
   * Constructs API URL by appending .js to the product page URL
   * @param {string} url - Product page URL
   * @returns {string} API URL with .js suffix
   */
  constructApiUrl(url) {
    try {
      // Remove any query parameters or hash fragments
      const urlObj = new URL(url);
      urlObj.search = '';
      urlObj.hash = '';
      
      // Append .js to the clean URL (without query params)
      const baseUrl = urlObj.toString();
      const apiUrl = baseUrl + '.js';
      
      console.log(`Original URL: ${url}`);
      console.log(`API URL (after removing query params): ${apiUrl}`);
      
      return apiUrl;
    } catch (error) {
      console.error('Error constructing API URL:', error.message);
      return null;
    }
  }

  /**
   * Fetches product data from Freakins API
   * @param {string} url - Product page URL
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProduct(url) {
    try {
      const apiUrl = this.constructApiUrl(url);
      
      if (!apiUrl) {
        return null;
      }

      console.log('Fetching Freakins product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Freakins API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from Freakins API:', error.message);
      return null;
    }
  }

  /**
   * Extracts product image from API response and ensures it has https:// prefix
   * @param {Object} apiResponse - API response object
   * @returns {string|null} Product image URL or null if not found
   */
  extractProductImage(apiResponse) {
    try {
      if (apiResponse && apiResponse.featured_image) {
        let imageUrl = apiResponse.featured_image;
        
        // Add https:// prefix if it doesn't have it
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // If it starts with //, just add https:
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else {
            // Otherwise add https:// prefix
            imageUrl = 'https://' + imageUrl;
          }
        }
        
        return imageUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product image from API response:', error.message);
      return null;
    }
  }

  /**
   * Extracts product gallery images from API response
   * Prefixes 'https:' to each image URL in the images array
   * @param {Object} apiResponse - API response object
   * @returns {Array<string>} Array of image URLs with https: prefix
   */
  extractFreakinsGalleryImages(apiResponse) {
    try {
      if (!apiResponse || !apiResponse.images || !Array.isArray(apiResponse.images)) {
        return [];
      }

      const imageList = apiResponse.images
        .map(imageItem => {
          if (!imageItem) {
            return null;
          }
          // If imageItem is a string, use it directly; if it's an object, try to get a URL property
          const imageUrl = typeof imageItem === 'string' ? imageItem : (imageItem.url || imageItem.src || imageItem);
          
          if (!imageUrl || typeof imageUrl !== 'string') {
            return null;
          }
          
          // Prefix 'https:' if not already present
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
          } else if (imageUrl.startsWith('//')) {
            return 'https:' + imageUrl;
          } else {
            return 'https:' + (imageUrl.startsWith('/') ? '' : '//') + imageUrl;
          }
        })
        .filter(url => url !== null);

      return imageList;
    } catch (error) {
      console.error('Error extracting Freakins gallery images from API response:', error.message);
      return [];
    }
  }

  /**
   * Gets product image from Freakins product page URL
   * @param {string} url - Product page URL
   * @returns {Promise<Object>} Object with image and imageList properties
   */
  async getProductImage(url) {
    try {
      const apiResponse = await this.fetchProduct(url);
      
      if (!apiResponse) {
        return {
          image: null,
          imageList: []
        };
      }

      const imageUrl = this.extractProductImage(apiResponse);
      const imageList = this.extractFreakinsGalleryImages(apiResponse);

      return {
        image: imageUrl,
        imageList
      };
    } catch (error) {
      console.error('Error getting product image:', error.message);
      return {
        image: null,
        imageList: []
      };
    }
  }
}

export default new FreakinsApiService();

