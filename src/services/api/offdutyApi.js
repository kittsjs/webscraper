/**
 * Offduty API Service
 * Handles API calls to Offduty product API
 */

class OffdutyApiService {
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
   * Fetches product data from Offduty API
   * @param {string} url - Product page URL
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProduct(url) {
    try {
      const apiUrl = this.constructApiUrl(url);
      
      if (!apiUrl) {
        return null;
      }

      console.log('Fetching Offduty product from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Offduty API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from Offduty API:', error.message);
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
   * Gets product image from Offduty product page URL
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

export default new OffdutyApiService();

