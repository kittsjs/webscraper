/**
 * Aachho API Service
 * Handles API calls to Aachho product API
 */

class AachhoApiService {
  /**
   * Constructs API URL by appending .json to the product page URL
   * @param {string} url - Product page URL
   * @returns {string} API URL with .json suffix
   */
  constructApiUrl(url) {
    try {
      // Remove any query parameters or hash fragments
      const urlObj = new URL(url);
      urlObj.search = '';
      urlObj.hash = '';
      
      // Append .json to the pathname
      const baseUrl = urlObj.toString();
      const apiUrl = baseUrl + '.js';
      
      return apiUrl;
    } catch (error) {
      console.error('Error constructing API URL:', error.message);
      return null;
    }
  }

  /**
   * Fetches product data from Aachho API
   * @param {string} url - Product page URL
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProduct(url) {
    try {
      const apiUrl = this.constructApiUrl(url);
      
      if (!apiUrl) {
        return null;
      }

      console.log('Fetching Aachho product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Aachho API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from Aachho API:', error.message);
      return null;
    }
  }

  /**
   * Extracts product image from API response
   * @param {Object} apiResponse - API response object
   * @returns {string|null} Product image URL or null if not found
   */
  extractProductImage(apiResponse) {
    try {
      if (apiResponse && apiResponse.featured_image) {
        return apiResponse.featured_image;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product image from API response:', error.message);
      return null;
    }
  }

  /**
   * Extracts product gallery images from API response
   * Prefixes 'https:' to each image URL in the product.images array
   * @param {Object} apiResponse - API response object
   * @returns {Array<string>} Array of image URLs with https: prefix
   */
  extractAachhoGalleryImages(apiResponse) {
    
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
      console.error('Error extracting Aachho gallery images from API response:', error.message);
      return [];
    }
  }

  /**
   * Gets product image from Aachho product page URL
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
      const imageList = this.extractAachhoGalleryImages(apiResponse);

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

export default new AachhoApiService();

