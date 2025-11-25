/**
 * Saadaa API Service
 * Handles API calls to Saadaa product API
 */

class SaadaaApiService {
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
      const apiUrl = baseUrl + '.json';
      
      return apiUrl;
    } catch (error) {
      console.error('Error constructing API URL:', error.message);
      return null;
    }
  }

  /**
   * Fetches product data from Saadaa API
   * @param {string} url - Product page URL
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProduct(url) {
    try {
      const apiUrl = this.constructApiUrl(url);
      
      if (!apiUrl) {
        return null;
      }

      console.log('Fetching Saadaa product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Saadaa API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from Saadaa API:', error.message);
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
      if (apiResponse && 
          apiResponse.product && 
          apiResponse.product.image && 
          apiResponse.product.image.src) {
        return apiResponse.product.image.src;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product image from API response:', error.message);
      return null;
    }
  }

  /**
   * Extracts product gallery images from API response
   * Extracts src property from each object in product.images array
   * @param {Object} apiResponse - API response object
   * @returns {Array<string>} Array of image URLs
   */
  extractSaadaaGalleryImages(apiResponse) {
    try {
      if (!apiResponse || 
          !apiResponse.product || 
          !apiResponse.product.images || 
          !Array.isArray(apiResponse.product.images)) {
        return [];
      }

      const imageList = apiResponse.product.images
        .map(imageObj => imageObj && imageObj.src)
        .filter(src => src && typeof src === 'string');

      return imageList;
    } catch (error) {
      console.error('Error extracting Saadaa gallery images from API response:', error.message);
      return [];
    }
  }

  /**
   * Gets product image from Saadaa product page URL
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
      const imageList = this.extractSaadaaGalleryImages(apiResponse);

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

export default new SaadaaApiService();

