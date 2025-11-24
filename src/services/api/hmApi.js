import { API_BASE_URLS } from '../../constants/apiConstants.js';

/**
 * H&M API Service
 * Handles API calls to H&M search services
 */

class HmApiService {
  /**
   * Extracts product ID from H&M product page URL
   * @param {string} url - H&M product page URL (e.g., https://www2.hm.com/en_in/productpage.0863595006.html)
   * @returns {string|null} Product ID or null if not found
   */
  extractProductId(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract ID from pathname like "/en_in/productpage.0863595006.html"
      const match = pathname.match(/productpage\.(\d+)\.html/);
      
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
   * Extracts locale from H&M product page URL
   * @param {string} url - H&M product page URL
   * @returns {string} Locale (e.g., "en_in")
   */
  extractLocale(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract locale from pathname like "/en_in/productpage.0863595006.html"
      const match = pathname.match(/\/([a-z]{2}_[a-z]{2})\//);
      
      if (match && match[1]) {
        return match[1];
      }
      
      // Default to en_in if not found
      return 'en_in';
    } catch (error) {
      console.error('Error extracting locale from URL:', error.message);
      return 'en_in';
    }
  }

  /**
   * Fetches product data from H&M API
   * @param {string} productId - Product ID
   * @param {string} locale - Locale (e.g., "en_in")
   * @returns {Promise<Object|null>} Product data or null if failed
   */
  async fetchProductById(productId, locale = 'en_in') {
    try {
      const apiUrl = `${API_BASE_URLS.HM}/${locale}/search/byids`;
      const params = new URLSearchParams({
        ids: productId,
        touchPoint: 'DESKTOP',
        pageSource: 'pdp-shopthelook'
      });

      const fullUrl = `${apiUrl}?${params.toString()}`;
      console.log('Fetching H&M product from API:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`H&M API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product from H&M API:', error.message);
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
          apiResponse.articles && 
          apiResponse.articles.productList && 
          apiResponse.articles.productList.length > 0) {
        
        const product = apiResponse.articles.productList[0];
        
        // Extract productImage from product object
        if (product.productImage) {
          return product.productImage;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting product image from API response:', error.message);
      return null;
    }
  }

  /**
   * Gets product image from H&M product page URL
   * @param {string} url - H&M product page URL
   * @returns {Promise<string|null>} Product image URL or null if not found
   */
  async getProductImage(url) {
    try {
      const productId = this.extractProductId(url);
      
      if (!productId) {
        console.error('Could not extract product ID from URL:', url);
        return null;
      }

      const locale = this.extractLocale(url);
      console.log(`Extracted product ID: ${productId}, locale: ${locale}`);

      const apiResponse = await this.fetchProductById(productId, locale);
      
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

export default new HmApiService();

