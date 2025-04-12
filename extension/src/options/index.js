// Options script for Tab DNA extension
import '../popup/styles.css';
import { clearTabData } from '../utils/storage';

// DOM elements
const storeLocallyOnly = document.getElementById('storeLocallyOnly');
const dataRetention = document.getElementById('dataRetention');
const clearDataBtn = document.getElementById('clearDataBtn');
const defaultView = document.getElementById('defaultView');
const graphLayout = document.getElementById('graphLayout');
const colorCodeDomains = document.getElementById('colorCodeDomains');
const showFavicons = document.getElementById('showFavicons');
const enableDistraction = document.getElementById('enableDistraction');
const enableAITagging = document.getElementById('enableAITagging');
const saveBtn = document.getElementById('saveBtn');
const saveConfirmation = document.getElementById('saveConfirmation');

// Default settings
const defaultSettings = {
  storeLocallyOnly: true,
  dataRetention: '7',
  defaultView: 'currentTab',
  graphLayout: 'tree',
  colorCodeDomains: true,
  showFavicons: true,
  enableDistraction: false,
  enableAITagging: false
};

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  loadSettings();
  
  // Set up event listeners
  setupEventListeners();
});

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['tabDNASettings'], (result) => {
    const settings = result.tabDNASettings || defaultSettings;
    
    // Apply settings to form
    storeLocallyOnly.checked = settings.storeLocallyOnly;
    dataRetention.value = settings.dataRetention;
    defaultView.value = settings.defaultView;
    graphLayout.value = settings.graphLayout;
    colorCodeDomains.checked = settings.colorCodeDomains;
    showFavicons.checked = settings.showFavicons;
    enableDistraction.checked = settings.enableDistraction;
    enableAITagging.checked = settings.enableAITagging;
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    storeLocallyOnly: storeLocallyOnly.checked,
    dataRetention: dataRetention.value,
    defaultView: defaultView.value,
    graphLayout: graphLayout.value,
    colorCodeDomains: colorCodeDomains.checked,
    showFavicons: showFavicons.checked,
    enableDistraction: enableDistraction.checked,
    enableAITagging: enableAITagging.checked
  };
  
  chrome.storage.local.set({ tabDNASettings: settings }, () => {
    // Show confirmation
    saveConfirmation.classList.remove('hidden');
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      saveConfirmation.classList.add('hidden');
    }, 3000);
  });
}

// Clear all data
function clearAllData() {
  if (confirm('Are you sure you want to clear all browsing history data? This cannot be undone.')) {
    clearTabData().then(() => {
      alert('All data has been cleared successfully.');
    }).catch(error => {
      alert('Error clearing data: ' + error.message);
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Save button
  saveBtn.addEventListener('click', saveSettings);
  
  // Clear data button
  clearDataBtn.addEventListener('click', clearAllData);
  
  // Data retention change
  dataRetention.addEventListener('change', () => {
    if (dataRetention.value === '-1') {
      if (!confirm('Storing data forever may use a lot of storage space over time. Are you sure?')) {
        dataRetention.value = '7';
      }
    }
  });
  
  // Advanced features warnings
  enableDistraction.addEventListener('change', () => {
    if (enableDistraction.checked) {
      alert('Distraction alerts are an experimental feature and may not be 100% accurate.');
    }
  });
  
  enableAITagging.addEventListener('change', () => {
    if (enableAITagging.checked) {
      alert('AI tagging is an experimental feature that uses basic heuristics to categorize your tabs. No data is sent to external servers.');
    }
  });
}
