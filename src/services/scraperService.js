import puppeteer from 'puppeteer';
import {
  isApiOnlyDomainName,
  getExtractorForDomainName
} from './domainConfig/domainMappings.js';
import { execSync } from 'child_process';
import fs from 'fs';

function installAndFindChrome() {
  // if env var exists and is valid, use it
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  // look for chrome under the runtime installer folder
  const runtimeBase = '/tmp/puppeteer_chrome';
  try {
    // if we already installed at runtime, the binary should exist
    if (fs.existsSync(runtimeBase)) {
      const out = execSync("find /tmp/puppeteer_chrome -type f \\( -name chrome -o -name chrome-headless-shell \\) -perm -111 2>/dev/null || true", { encoding: 'utf8' }).trim();
      if (out) return out.split('\\n')[0];


    }
  } catch (e) {}

  // fallback: attempt quick system find (fast, limited depth)
  try {
    const out2 = execSync("find /opt/render/project/.render /opt/render -maxdepth 6 -type f \\( -name chrome -o -name chrome-headless-shell \\) -perm -111 2>/dev/null || true", { encoding: 'utf8' }).trim();
    if (out2) return out2.split('\\n')[0];
  } catch (e) {}

  return null;
}

class ScraperService {
  /**
   * Normalizes domain from URL by removing www. prefix
   * @param {string} url - The URL to analyze
   * @returns {string|null} Normalized domain name or null if invalid
   */
  normalizeDomain(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return hostname.replace(/^www\./, '');
    } catch (error) {
      console.error('Error normalizing domain:', error.message);
      return null;
    }
  }

  /**
   * Checks if a domain uses API-only extraction (no Puppeteer needed)
   * @param {string} url - The URL to analyze
   * @returns {boolean} True if domain uses API-only extraction
   */
  isApiOnlyDomain(url) {
    const domain = this.normalizeDomain(url);
    if (!domain) {
      return false;
    }
    return isApiOnlyDomainName(domain);
  }

  /**
   * Detects the domain from a URL and returns the corresponding extraction function
   * @param {string} url - The URL to analyze
   * @returns {Function|null} The extraction function for the domain, or null if not supported
   */
  getExtractorForDomain(url) {
    const domain = this.normalizeDomain(url);
    if (!domain) {
      console.log('Invalid URL format');
      return null;
    }
    
    const extractor = getExtractorForDomainName(domain);
    
    if (!extractor) {
      console.log(`No extractor found for domain: ${domain}`);
    }
    
    return extractor;
  }

  /**
   * Extracts product image from an e-commerce URL
   * @param {string} url - The URL of the e-commerce product page
   * @returns {Promise<string|null>} Single image URL or null if not found
   */
  async extractProductImages(url) {
    try {
      console.log('Starting to extract image from:', url);
      
      // Get the appropriate extraction function based on domain
      const extractor = this.getExtractorForDomain(url);
      
      if (!extractor) {
        throw new Error(`Unsupported domain. No extractor available for: ${url}`);
      }

      // Check if this is an API-only domain (no Puppeteer needed)
      if (this.isApiOnlyDomain(url)) {
        console.log('Using API-only extraction (skipping Puppeteer)...');
        
        // For API-only domains, pass null as page since it won't be used
        const imageUrl = await extractor(null, url);
        
        if (imageUrl) {
          console.log(`Extracted image: ${imageUrl}`);
        } else {
          console.log('No image found');
        }
        
        return imageUrl;
      }

      // For scraping-based domains, use Puppeteer
      return await this.extractWithPuppeteer(url, extractor);

    } catch (error) {
      console.error('Error in scraper:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide more helpful error messages
      if (error.message.includes('socket') || error.message.includes('hang up')) {
        throw new Error(`Connection was closed by the server. This often happens with sites that have bot detection (like Myntra, Flipkart, Amazon). Error: ${error.message}`);
      }
      
      throw new Error(`Failed to extract images: ${error.message}`);
    }
  }

  /**
   * Extracts product image using Puppeteer (for scraping-based domains)
   * @param {string} url - The URL of the e-commerce product page
   * @param {Function} extractor - The extraction function to use
   * @returns {Promise<string|null>} Single image URL or null if not found
   */
  async extractWithPuppeteer(url, extractor) {
    let browser = null;
    
    try {
      console.log('Using Puppeteer for extraction...');
      const chromePath = installAndFindChrome();
      console.log('resolved chromePath: ', chromePath);
      if (!chromePath) {
        console.error('Chrome executable not found. Checked common Render paths.');
        // optional: print dirs for debugging
        try { console.error('ls /opt/render/project/.render ->', fs.readdirSync('/opt/render/project/.render')); } catch(e){}
        throw new Error('Chrome binary not found');
      }
      // Launch browser with headless mode and stealth settings
      browser = await puppeteer.launch({
        headless: 'new',
        executablePath: chromePath,
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
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      });
      
      // Remove webdriver property and other bot detection signals
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
        
        // Override plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        // Override languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
        
        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
        
        // Override Chrome runtime
        window.chrome = {
          runtime: {}
        };
        
        // Mock missing properties
        Object.defineProperty(navigator, 'platform', {
          get: () => 'Win32',
        });
        
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8,
        });
        
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8,
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

      console.log('Extracting image using site-specific extractor...');
      
      // Call the domain-specific extraction function
      // Pass both page and url - extractors can use either or both
      const imageUrl = await extractor(page, url);
      
      if (imageUrl) {
        console.log(`Extracted image: ${imageUrl}`);
      } else {
        console.log('No image found');
      }
      
      return imageUrl;

    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default new ScraperService();
