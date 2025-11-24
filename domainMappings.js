/**
 * Domain Configuration
 * Maps domains to their extraction functions and identifies API-only domains
 */

import {
  extractAmazonImages,
  extractFlipkartImages,
  extractMyntraImages,
  extractSouledStoreImages,
  extractAjioImages,
  extractHmImages,
  extractTheHouseOfRareImages,
  extractAachhoImages,
  extractSaadaaImages,
  extractHouseOfChikankariImages,
  extractOffdutyImages,
  extractFreakinsImages,
  extractLibasImages,
  extractBewakoofImages,
  extractWforwomenImages,
  extractShoppersstopImages,
  extractVeromodaImages
} from '../siteExtractors.js';

/**
 * Domains that use API-only extraction (no Puppeteer needed)
 */
export const API_ONLY_DOMAINS = [
  'ajio.com',
  'hm.com',
  'hm.co.in',
  'thehouseofrare.com',
  'aachho.com',
  'saadaa.in',
  'houseofchikankari.in',
  'offduty.in',
  'freakins.com',
  'wforwomen.com',
  'wforwoman.com'
];

/**
 * Domain mapping to extraction functions
 */
export const DOMAIN_EXTRACTOR_MAP = {
  'amazon.in': extractAmazonImages,
  'amazon.com': extractAmazonImages,
  'amazon.co.uk': extractAmazonImages,
  'amazon.com.au': extractAmazonImages,
  'flipkart.com': extractFlipkartImages,
  'myntra.com': extractMyntraImages,
  'thesouledstore.com': extractSouledStoreImages,
  'ajio.com': extractAjioImages,
  'hm.com': extractHmImages,
  'hm.co.in': extractHmImages,
  'thehouseofrare.com': extractTheHouseOfRareImages,
  'aachho.com': extractAachhoImages,
  'saadaa.in': extractSaadaaImages,
  'houseofchikankari.in': extractHouseOfChikankariImages,
  'offduty.in': extractOffdutyImages,
  'freakins.com': extractFreakinsImages,
  'libas.in': extractLibasImages,
  'bewakoof.com': extractBewakoofImages,
  'wforwomen.com': extractWforwomenImages,
  'wforwoman.com': extractWforwomenImages,
  'shoppersstop.com': extractShoppersstopImages,
  'veromoda.in': extractVeromodaImages
};

/**
 * Checks if a domain is API-only
 * @param {string} domain - Domain name (without www. prefix)
 * @returns {boolean} True if domain uses API-only extraction
 */
export function isApiOnlyDomainName(domain) {
  // Check for exact match
  if (API_ONLY_DOMAINS.includes(domain)) {
    return true;
  }
  
  // Check for partial matches (subdomains)
  for (const apiDomain of API_ONLY_DOMAINS) {
    if (domain.includes(apiDomain) || domain.endsWith('.' + apiDomain)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets the extraction function for a domain
 * @param {string} domain - Domain name (without www. prefix)
 * @returns {Function|null} The extraction function for the domain, or null if not supported
 */
export function getExtractorForDomainName(domain) {
  // Check for exact match first
  if (DOMAIN_EXTRACTOR_MAP[domain]) {
    return DOMAIN_EXTRACTOR_MAP[domain];
  }
  
  // Check for partial matches (subdomains)
  for (const [key, extractor] of Object.entries(DOMAIN_EXTRACTOR_MAP)) {
    if (domain.includes(key) || domain.endsWith('.' + key)) {
      return extractor;
    }
  }
  
  return null;
}

