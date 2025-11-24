import { API_BASE_URLS } from '../../constants/apiConstants.js';

/**
 * Ajio API Service
 * Handles API calls to Ajio product API
 */

class AjioApiService {
  /**
   * Extracts product ID from Ajio product page URL
   * @param {string} url - Ajio product page URL (e.g., https://www.ajio.com/the-bear-house-men-slim-fit-shirt/p/700756727_teal?)
   * @returns {string|null} Product ID or null if not found
   */
  extractProductId(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract ID from pathname like "/the-bear-house-men-slim-fit-shirt/p/700756727_teal"
      // The product ID is the part after "/p/"
      const match = pathname.match(/\/p\/([^\/]+)/);
      
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product ID from URL:', error.message);
      return null;
    }
  }

  /**
   * Fetches product data from Ajio API
   * @param {string} productId - Product ID (e.g., "700756727_teal")
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProductById(productId) {
    try {
      const apiUrl = `${API_BASE_URLS.AJIO}/p/${productId}`;
      console.log('Fetching Ajio product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Ajio API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from Ajio API:', error.message);
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
          apiResponse.baseOptions && 
          Array.isArray(apiResponse.baseOptions) && 
          apiResponse.baseOptions.length > 0) {
        
        const firstBaseOption = apiResponse.baseOptions[0];
        
        if (firstBaseOption && 
            firstBaseOption.options && 
            Array.isArray(firstBaseOption.options) && 
            firstBaseOption.options.length > 0) {
          
          const firstOption = firstBaseOption.options[0];
          
          if (firstOption && 
              firstOption.modelImage && 
              firstOption.modelImage.url) {
            return firstOption.modelImage.url;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product image from API response:', error.message);
      return null;
    }
  }

  /**
   * Gets product image from Ajio product page URL
   * @param {string} url - Ajio product page URL
   * @returns {Promise<string|null>} Product image URL or null if not found
   */
  async getProductImage(url) {
    try {
      const productId = this.extractProductId(url);
      
      if (!productId) {
        console.error('Could not extract product ID from URL:', url);
        return null;
      }

      console.log(`Extracted product ID: ${productId}`);

      const apiResponse = await this.fetchProductById(productId);
      
      if (!apiResponse) {
        return null;
      }

      const imageUrl = this.extractProductImage(apiResponse);
      return imageUrl;
    } catch (error) {
      console.error('Error getting product image:', error.message);
      return null;
    }
  }
}

export default new AjioApiService();

