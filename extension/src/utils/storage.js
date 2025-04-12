// Storage utility functions for Tab DNA extension

/**
 * Save tab data to local storage
 * @param {string} tabId - The ID of the tab
 * @param {object} data - The data to save
 * @returns {Promise} - A promise that resolves when the data is saved
 */
export function saveTabData(tabId, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabDNA'], (result) => {
      const tabDNA = result.tabDNA || {
        sessions: [],
        currentSession: {
          id: generateSessionId(),
          startTime: Date.now(),
          tabs: {}
        }
      };
      
      // Add or update tab data in the current session
      tabDNA.currentSession.tabs[tabId] = data;
      
      // Save to storage
      chrome.storage.local.set({ tabDNA }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Get tab data from local storage
 * @param {string} tabId - The ID of the tab
 * @returns {Promise} - A promise that resolves with the tab data
 */
export function getTabData(tabId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabDNA'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      const tabDNA = result.tabDNA;
      if (!tabDNA || !tabDNA.currentSession || !tabDNA.currentSession.tabs[tabId]) {
        resolve(null);
        return;
      }
      
      resolve(tabDNA.currentSession.tabs[tabId]);
    });
  });
}

/**
 * Get all tab data from local storage
 * @returns {Promise} - A promise that resolves with all tab data
 */
export function getAllTabData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabDNA'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      resolve(result.tabDNA || null);
    });
  });
}

/**
 * Clear all tab data from local storage
 * @returns {Promise} - A promise that resolves when the data is cleared
 */
export function clearTabData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(['tabDNA'], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get all sessions from local storage
 * @returns {Promise} - A promise that resolves with all sessions
 */
export function getAllSessions() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabDNA'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      const tabDNA = result.tabDNA;
      if (!tabDNA) {
        resolve([]);
        return;
      }
      
      // Return all sessions plus the current session
      resolve([...tabDNA.sessions, tabDNA.currentSession]);
    });
  });
}

/**
 * Get a specific session from local storage
 * @param {string} sessionId - The ID of the session
 * @returns {Promise} - A promise that resolves with the session data
 */
export function getSession(sessionId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['tabDNA'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      const tabDNA = result.tabDNA;
      if (!tabDNA) {
        resolve(null);
        return;
      }
      
      // Check if it's the current session
      if (tabDNA.currentSession && tabDNA.currentSession.id === sessionId) {
        resolve(tabDNA.currentSession);
        return;
      }
      
      // Look in past sessions
      const session = tabDNA.sessions.find(s => s.id === sessionId);
      resolve(session || null);
    });
  });
}

/**
 * Generate a unique session ID
 * @returns {string} - A unique session ID
 */
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Export tab data as JSON
 * @returns {Promise} - A promise that resolves with the JSON data
 */
export function exportTabDataAsJson() {
  return new Promise((resolve, reject) => {
    getAllTabData()
      .then(data => {
        if (!data) {
          reject(new Error('No data to export'));
          return;
        }
        
        const jsonData = JSON.stringify(data, null, 2);
        resolve(jsonData);
      })
      .catch(reject);
  });
}
