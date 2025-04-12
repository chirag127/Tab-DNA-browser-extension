/**
 * Format time spent in milliseconds to a human-readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} - Formatted time string
 */
export function formatTimeSpent(ms) {
  if (!ms) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Format a URL for display
 * @param {string} url - The URL to format
 * @param {number} maxLength - Maximum length before truncating
 * @returns {string} - Formatted URL
 */
export function formatUrl(url, maxLength = 50) {
  if (!url) return '';
  
  try {
    // Remove protocol
    let formatted = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Truncate if too long
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength) + '...';
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting URL:', error);
    return url;
  }
}

/**
 * Get domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - Domain name
 */
export function getDomain(url) {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Error getting domain:', error);
    return '';
  }
}

/**
 * Get favicon URL for a domain
 * @param {string} url - The URL to get favicon for
 * @returns {string} - Favicon URL
 */
export function getFaviconUrl(url) {
  if (!url) return 'icons/icon16.png';
  
  try {
    const domain = getDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch (error) {
    console.error('Error getting favicon URL:', error);
    return 'icons/icon16.png';
  }
}

/**
 * Truncate a string to a certain length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated string
 */
export function truncateString(str, length) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}
