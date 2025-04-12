// Background script for Tab DNA extension
import { saveTabData, getTabData, getAllTabData, clearTabData } from '../utils/storage';

// Store for tracking tab relationships
const tabRelationships = {};
// Store for tracking time spent on tabs
const tabTimeTracker = {};

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab DNA extension installed');
  
  // Initialize storage
  chrome.storage.local.get(['tabDNA'], (result) => {
    if (!result.tabDNA) {
      chrome.storage.local.set({
        tabDNA: {
          sessions: [],
          currentSession: {
            id: generateSessionId(),
            startTime: Date.now(),
            tabs: {}
          }
        }
      });
    }
  });
});

// Listen for tab creation events
chrome.tabs.onCreated.addListener((tab) => {
  const creationTime = Date.now();
  
  // Store the creation time for this tab
  tabTimeTracker[tab.id] = {
    startTime: creationTime,
    lastActiveTime: creationTime,
    totalTimeSpent: 0
  };
  
  // Get the opener tab if it exists
  if (tab.openerTabId) {
    chrome.tabs.get(tab.openerTabId, (openerTab) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      
      // Store the relationship
      tabRelationships[tab.id] = {
        parentId: tab.openerTabId,
        url: tab.pendingUrl || tab.url || '',
        title: tab.title || 'New Tab',
        creationTime,
        children: []
      };
      
      // Update the parent's children list
      if (tabRelationships[tab.openerTabId]) {
        tabRelationships[tab.openerTabId].children.push(tab.id);
      }
      
      // Save to storage
      updateTabDataInStorage(tab.id);
    });
  } else {
    // No opener tab, this is a root tab
    tabRelationships[tab.id] = {
      parentId: null,
      url: tab.pendingUrl || tab.url || '',
      title: tab.title || 'New Tab',
      creationTime,
      children: []
    };
    
    // Save to storage
    updateTabDataInStorage(tab.id);
  }
});

// Listen for tab updates (URL changes, title changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabRelationships[tabId]) {
    // Update the stored information
    if (changeInfo.url) {
      tabRelationships[tabId].url = changeInfo.url;
    }
    
    if (changeInfo.title) {
      tabRelationships[tabId].title = changeInfo.title;
    }
    
    // Save to storage
    updateTabDataInStorage(tabId);
  }
});

// Track tab activation to measure time spent
chrome.tabs.onActivated.addListener(({ tabId }) => {
  const currentTime = Date.now();
  
  // Update time for previously active tab
  Object.keys(tabTimeTracker).forEach(id => {
    const tracker = tabTimeTracker[id];
    if (tracker.lastActiveTime && id != tabId) {
      tracker.totalTimeSpent += currentTime - tracker.lastActiveTime;
      tracker.lastActiveTime = null;
    }
  });
  
  // Set current tab as active
  if (tabTimeTracker[tabId]) {
    tabTimeTracker[tabId].lastActiveTime = currentTime;
  } else {
    tabTimeTracker[tabId] = {
      startTime: currentTime,
      lastActiveTime: currentTime,
      totalTimeSpent: 0
    };
  }
  
  // Update storage with new time data
  updateTabDataInStorage(tabId);
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabRelationships[tabId]) {
    // If this tab has a parent, remove this tab from the parent's children list
    const parentId = tabRelationships[tabId].parentId;
    if (parentId && tabRelationships[parentId]) {
      const childIndex = tabRelationships[parentId].children.indexOf(tabId);
      if (childIndex !== -1) {
        tabRelationships[parentId].children.splice(childIndex, 1);
      }
    }
    
    // Update time spent before removing
    if (tabTimeTracker[tabId] && tabTimeTracker[tabId].lastActiveTime) {
      tabTimeTracker[tabId].totalTimeSpent += Date.now() - tabTimeTracker[tabId].lastActiveTime;
    }
    
    // Save final data to storage before removing
    updateTabDataInStorage(tabId);
    
    // Remove from memory
    delete tabRelationships[tabId];
    delete tabTimeTracker[tabId];
  }
});

// Listen for navigation events to track referrers
chrome.webNavigation.onCommitted.addListener((details) => {
  // Only track main frame navigations
  if (details.frameId === 0) {
    const { tabId, url, transitionType, transitionQualifiers } = details;
    
    // Skip about:, chrome:, etc.
    if (url.startsWith('http')) {
      if (tabRelationships[tabId]) {
        // Update the URL
        tabRelationships[tabId].url = url;
        
        // If this is a link navigation, try to capture referrer
        if (transitionType === 'link') {
          // The actual referrer would be captured in the content script
          // Here we just mark that this was a link navigation
          tabRelationships[tabId].transitionType = 'link';
        } else {
          tabRelationships[tabId].transitionType = transitionType;
        }
        
        // Save to storage
        updateTabDataInStorage(tabId);
      }
    }
  }
});

// Helper function to update tab data in storage
function updateTabDataInStorage(tabId) {
  chrome.storage.local.get(['tabDNA'], (result) => {
    if (result.tabDNA) {
      const tabDNA = result.tabDNA;
      const currentSession = tabDNA.currentSession;
      
      // Add or update tab data in the current session
      if (tabRelationships[tabId]) {
        currentSession.tabs[tabId] = {
          ...tabRelationships[tabId],
          timeData: tabTimeTracker[tabId] || { totalTimeSpent: 0 }
        };
      }
      
      // Update storage
      chrome.storage.local.set({ tabDNA });
    }
  });
}

// Generate a unique session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTabData') {
    sendResponse({
      tabData: tabRelationships[message.tabId] || null,
      timeData: tabTimeTracker[message.tabId] || null
    });
  } else if (message.action === 'getAllTabData') {
    sendResponse({
      tabRelationships,
      tabTimeTracker
    });
  } else if (message.action === 'setReferrer') {
    // Update referrer information from content script
    const { tabId, referrer } = message;
    if (tabRelationships[tabId]) {
      tabRelationships[tabId].referrer = referrer;
      updateTabDataInStorage(tabId);
    }
    sendResponse({ success: true });
  } else if (message.action === 'startNewSession') {
    // Start a new session
    chrome.storage.local.get(['tabDNA'], (result) => {
      if (result.tabDNA) {
        const tabDNA = result.tabDNA;
        
        // Move current session to sessions array
        if (tabDNA.currentSession) {
          tabDNA.sessions.push(tabDNA.currentSession);
        }
        
        // Create new session
        tabDNA.currentSession = {
          id: generateSessionId(),
          startTime: Date.now(),
          tabs: {}
        };
        
        // Update storage
        chrome.storage.local.set({ tabDNA }, () => {
          sendResponse({ success: true });
        });
      }
    });
    return true; // Indicate async response
  }
});
