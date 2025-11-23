import puppeteer from 'puppeteer';

class ScraperService {
  /**
   * Extracts product images from an e-commerce URL
   * @param {string} url - The URL of the e-commerce product page
   * @returns {Promise<Array<string>>} Array of image URLs
   */
  async extractProductImages(url) {
    let browser = null;
    
    try {
      console.log('Starting to scrape:', url);
      
      // Launch browser with headless mode and stealth settings
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        ignoreHTTPSErrors: true
      });

      const page = await browser.newPage();
      
      // Set a realistic user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set extra headers to look like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });
      
      // Remove webdriver property and other bot detection signals
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
        
        // Override plugins and languages
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      });
      
      // Set a reasonable viewport size
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log('Navigating to page...');
      
      // Navigate to the URL with better error handling
      try {
        await page.goto(url, {
          waitUntil: 'load',
          timeout: 60000
        });
      } catch (gotoError) {
        // If initial goto fails, try with a different wait strategy
        if (gotoError.message.includes('socket') || gotoError.message.includes('hang up')) {
          console.log('First attempt failed, trying alternative approach...');
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
          });
        } else {
          throw gotoError;
        }
      }
      
      console.log('Page loaded, waiting for dynamic content...');

      // Wait for dynamic content using Promise-based delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try to evaluate - handle frame detachment
      let pageStatus;
      try {
        pageStatus = await page.evaluate(() => {
          const imgCount = document.querySelectorAll('img').length;
          const hasImages = imgCount > 0;
          return {
              loaded: true,
              title: document.title,
              imageCount: imgCount,
              hasImages: hasImages,
              readyState: document.readyState
          };
        });
      } catch (evalError) {
        if (evalError.message.includes('detached') || evalError.message.includes('Target closed')) {
          console.log('Page navigated away, trying to wait for new page...');
          // Wait a bit more for navigation to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try again after navigation
          pageStatus = await page.evaluate(() => {
            const imgCount = document.querySelectorAll('img').length;
            const hasImages = imgCount > 0;
            return {
                loaded: true,
                title: document.title,
                imageCount: imgCount,
                hasImages: hasImages,
                readyState: document.readyState
            };
          });
        } else {
          throw evalError;
        }
      }
    
      console.log('Page loaded:', pageStatus);
      return [];

    } catch (error) {
      console.error('Error in scraper:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide more helpful error messages
      if (error.message.includes('socket') || error.message.includes('hang up')) {
        throw new Error(`Connection was closed by the server. This often happens with sites that have bot detection (like Myntra, Flipkart, Amazon). Error: ${error.message}`);
      }
      
      throw new Error(`Failed to extract images: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default new ScraperService();
