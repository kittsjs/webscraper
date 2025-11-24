/**
 * The House of Rare API Service
 * Handles API calls to The House of Rare product API
 */

class TheHouseOfRareApiService {
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
   * Fetches product data from The House of Rare API
   * @param {string} url - Product page URL
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProduct(url) {
    try {
      const apiUrl = this.constructApiUrl(url);
      
      if (!apiUrl) {
        return null;
      }

      console.log('Fetching The House of Rare product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`The House of Rare API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from The House of Rare API:', error.message);
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
   * Gets product image from The House of Rare product page URL
   * @param {string} url - Product page URL
   * @returns {Promise<string|null>} Product image URL or null if not found
   */
  async getProductImage(url) {
    try {
      const apiResponse = await this.fetchProduct(url);
      
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

export default new TheHouseOfRareApiService();

