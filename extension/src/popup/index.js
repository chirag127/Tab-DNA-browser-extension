// Popup script for Tab DNA extension
import './styles.css';
import * as d3 from 'd3';
import { saveAs } from 'file-saver';
import { getAllTabData, getTabData, exportTabDataAsJson, getAllSessions, getSession } from '../utils/storage';

// DOM elements
const currentTabBtn = document.getElementById('currentTabBtn');
const allTabsBtn = document.getElementById('allTabsBtn');
const sessionsBtn = document.getElementById('sessionsBtn');
const currentTabView = document.getElementById('currentTabView');
const allTabsView = document.getElementById('allTabsView');
const sessionsView = document.getElementById('sessionsView');
const currentTitle = document.getElementById('currentTitle');
const currentUrl = document.getElementById('currentUrl');
const currentFavicon = document.getElementById('currentFavicon');
const tabGraph = document.getElementById('tabGraph');
const allTabsGraph = document.getElementById('allTabsGraph');
const expandAllBtn = document.getElementById('expandAllBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const exportPngBtn = document.getElementById('exportPngBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportBtn = document.getElementById('exportBtn');
const settingsBtn = document.getElementById('settingsBtn');
const sessionsList = document.getElementById('sessionsList');
const sessionTimeline = document.getElementById('sessionTimeline');
const timelineItems = document.getElementById('timelineItems');
const tooltip = document.getElementById('tooltip');

// Global variables
let currentTabId = null;
let tabData = null;
let allTabs = null;
let currentGraph = null;
let allTabsGraphInstance = null;

// Initialize the popup
document.addEventListener('DOMContentLoaded', () => {
  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      currentTabId = tab.id;
      
      // Update the current tab info
      updateCurrentTabInfo(tab);
      
      // Load the tab data
      loadTabData(tab.id);
      
      // Load all tabs data
      loadAllTabsData();
      
      // Load sessions data
      loadSessionsData();
    }
  });
  
  // Set up event listeners
  setupEventListeners();
});

// Update the current tab information
function updateCurrentTabInfo(tab) {
  currentTitle.textContent = tab.title || 'Unknown';
  currentUrl.textContent = tab.url || '';
  currentFavicon.src = tab.favIconUrl || 'icons/icon16.png';
}

// Load tab data and create the graph
function loadTabData(tabId) {
  // Get the tab data from the background script
  chrome.runtime.sendMessage({ action: 'getTabData', tabId }, (response) => {
    if (response && response.tabData) {
      tabData = response.tabData;
      
      // Create the graph
      createTabGraph(tabData, tabGraph);
    } else {
      // No data for this tab
      tabGraph.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No browsing history available for this tab.</div>';
    }
  });
}

// Load all tabs data
function loadAllTabsData() {
  chrome.runtime.sendMessage({ action: 'getAllTabData' }, (response) => {
    if (response && response.tabRelationships) {
      allTabs = response.tabRelationships;
      
      // Create the all tabs graph
      createAllTabsGraph(allTabs, allTabsGraph);
    } else {
      // No data
      allTabsGraph.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No browsing history available.</div>';
    }
  });
}

// Load sessions data
function loadSessionsData() {
  getAllSessions().then(sessions => {
    if (sessions && sessions.length > 0) {
      // Clear the sessions list
      sessionsList.innerHTML = '';
      
      // Add each session to the list
      sessions.forEach(session => {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50';
        
        const sessionDate = new Date(session.startTime);
        const tabCount = Object.keys(session.tabs).length;
        
        sessionItem.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium">${sessionDate.toLocaleDateString()} ${sessionDate.toLocaleTimeString()}</h4>
              <p class="text-sm text-gray-500">${tabCount} tabs</p>
            </div>
            <button class="view-session-btn px-3 py-1 bg-primary text-white rounded-md text-sm">View</button>
          </div>
        `;
        
        // Add click event to view the session
        sessionItem.querySelector('.view-session-btn').addEventListener('click', () => {
          viewSession(session);
        });
        
        sessionsList.appendChild(sessionItem);
      });
    } else {
      sessionsList.innerHTML = '<div class="text-gray-500">No sessions available.</div>';
    }
  });
}

// View a specific session
function viewSession(session) {
  // Show the session timeline
  sessionTimeline.classList.remove('hidden');
  
  // Clear the timeline items
  timelineItems.innerHTML = '';
  
  // Get all tabs in this session
  const tabs = Object.values(session.tabs);
  
  // Sort by creation time
  tabs.sort((a, b) => a.creationTime - b.creationTime);
  
  // Add each tab to the timeline
  tabs.forEach(tab => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    // Calculate time spent
    const timeSpent = tab.timeData ? formatTimeSpent(tab.timeData.totalTimeSpent) : '0s';
    
    // Get favicon
    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
    
    timelineItem.innerHTML = `
      <img src="${favicon}" alt="" class="favicon">
      <div class="flex-1 ml-2">
        <div class="font-medium text-sm truncate">${tab.title}</div>
        <div class="text-xs text-gray-500 truncate">${tab.url}</div>
      </div>
      <div class="time-spent">${timeSpent}</div>
    `;
    
    // Add click event to open the URL
    timelineItem.addEventListener('click', () => {
      chrome.tabs.create({ url: tab.url });
    });
    
    timelineItems.appendChild(timelineItem);
  });
}

// Format time spent
function formatTimeSpent(ms) {
  if (!ms) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Create the tab graph using D3.js
function createTabGraph(tabData, container) {
  // Clear the container
  container.innerHTML = '';
  
  // If no data, show a message
  if (!tabData) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No browsing history available for this tab.</div>';
    return;
  }
  
  // Create a hierarchical structure for D3
  const root = createHierarchy(tabData);
  
  // Set up the D3 tree layout
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, 20)`);
  
  // Create a tree layout
  const treeLayout = d3.tree().size([width - 100, height - 40]);
  
  // Compute the tree layout
  const treeData = treeLayout(d3.hierarchy(root));
  
  // Add links between nodes
  const links = svg.selectAll('.link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));
  
  // Add nodes
  const nodes = svg.selectAll('.node')
    .data(treeData.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);
  
  // Add circles for nodes
  nodes.append('circle')
    .attr('class', 'tab-node')
    .attr('r', 8)
    .on('mouseover', function(event, d) {
      // Show tooltip
      showTooltip(event, d.data);
    })
    .on('mouseout', function() {
      // Hide tooltip
      hideTooltip();
    })
    .on('click', function(event, d) {
      // Open the URL in a new tab
      if (d.data.url) {
        chrome.tabs.create({ url: d.data.url });
      }
    });
  
  // Add labels for nodes
  nodes.append('text')
    .attr('dy', '0.31em')
    .attr('x', d => d.children ? -12 : 12)
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .text(d => d.data.title ? truncateString(d.data.title, 20) : 'Unknown')
    .style('font-size', '12px')
    .style('fill', '#333');
  
  // Store the graph instance
  currentGraph = { svg, treeData };
}

// Create the all tabs graph
function createAllTabsGraph(allTabs, container) {
  // Clear the container
  container.innerHTML = '';
  
  // If no data, show a message
  if (!allTabs || Object.keys(allTabs).length === 0) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No browsing history available.</div>';
    return;
  }
  
  // Find root tabs (tabs with no parent)
  const rootTabs = Object.values(allTabs).filter(tab => !tab.parentId);
  
  // If no root tabs, show a message
  if (rootTabs.length === 0) {
    container.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No root tabs found.</div>';
    return;
  }
  
  // Create a hierarchical structure for D3
  const root = {
    id: 'root',
    title: 'All Tabs',
    children: rootTabs.map(tab => createHierarchy(tab, allTabs))
  };
  
  // Set up the D3 tree layout
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, 20)`);
  
  // Create a tree layout
  const treeLayout = d3.tree().size([width - 100, height - 40]);
  
  // Compute the tree layout
  const treeData = treeLayout(d3.hierarchy(root));
  
  // Add links between nodes
  const links = svg.selectAll('.link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));
  
  // Add nodes
  const nodes = svg.selectAll('.node')
    .data(treeData.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);
  
  // Add circles for nodes
  nodes.append('circle')
    .attr('class', 'tab-node')
    .attr('r', d => d.data.id === 'root' ? 10 : 8)
    .style('fill', d => d.data.id === 'root' ? '#ccc' : '#0078ff')
    .on('mouseover', function(event, d) {
      // Show tooltip
      if (d.data.id !== 'root') {
        showTooltip(event, d.data);
      }
    })
    .on('mouseout', function() {
      // Hide tooltip
      hideTooltip();
    })
    .on('click', function(event, d) {
      // Open the URL in a new tab
      if (d.data.id !== 'root' && d.data.url) {
        chrome.tabs.create({ url: d.data.url });
      }
    });
  
  // Add labels for nodes
  nodes.append('text')
    .attr('dy', '0.31em')
    .attr('x', d => d.children ? -12 : 12)
    .attr('text-anchor', d => d.children ? 'end' : 'start')
    .text(d => d.data.title ? truncateString(d.data.title, 20) : 'Unknown')
    .style('font-size', '12px')
    .style('fill', '#333');
  
  // Store the graph instance
  allTabsGraphInstance = { svg, treeData };
}

// Create a hierarchical structure for D3
function createHierarchy(tab, allTabs = null) {
  // If allTabs is provided, use it to build the hierarchy
  if (allTabs) {
    const node = {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      creationTime: tab.creationTime,
      children: []
    };
    
    // Add children
    if (tab.children && tab.children.length > 0) {
      tab.children.forEach(childId => {
        if (allTabs[childId]) {
          node.children.push(createHierarchy(allTabs[childId], allTabs));
        }
      });
    }
    
    return node;
  }
  
  // Otherwise, just return the tab data
  return {
    id: tab.id,
    title: tab.title,
    url: tab.url,
    creationTime: tab.creationTime,
    children: []
  };
}

// Show tooltip with tab information
function showTooltip(event, data) {
  const tooltipContent = `
    <div class="font-medium">${data.title}</div>
    <div class="text-xs mt-1">${data.url}</div>
    <div class="text-xs mt-1">Created: ${new Date(data.creationTime).toLocaleString()}</div>
  `;
  
  tooltip.innerHTML = tooltipContent;
  tooltip.style.left = `${event.pageX + 10}px`;
  tooltip.style.top = `${event.pageY + 10}px`;
  tooltip.classList.remove('hidden');
}

// Hide the tooltip
function hideTooltip() {
  tooltip.classList.add('hidden');
}

// Truncate a string to a certain length
function truncateString(str, length) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Export the graph as PNG
function exportAsPng() {
  if (!currentGraph) return;
  
  const svg = currentGraph.svg.node().parentNode;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const img = new Image();
  img.onload = function() {
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;
    context.drawImage(img, 0, 0);
    
    canvas.toBlob(function(blob) {
      saveAs(blob, 'tab-dna-graph.png');
    });
  };
  
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

// Export the data as JSON
function exportAsJson() {
  exportTabDataAsJson().then(jsonData => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, 'tab-dna-data.json');
  });
}

// Set up event listeners
function setupEventListeners() {
  // Tab navigation
  currentTabBtn.addEventListener('click', () => {
    currentTabBtn.classList.add('border-primary', 'text-primary');
    currentTabBtn.classList.remove('border-transparent', 'text-gray-500');
    allTabsBtn.classList.remove('border-primary', 'text-primary');
    allTabsBtn.classList.add('border-transparent', 'text-gray-500');
    sessionsBtn.classList.remove('border-primary', 'text-primary');
    sessionsBtn.classList.add('border-transparent', 'text-gray-500');
    
    currentTabView.classList.remove('hidden');
    allTabsView.classList.add('hidden');
    sessionsView.classList.add('hidden');
  });
  
  allTabsBtn.addEventListener('click', () => {
    allTabsBtn.classList.add('border-primary', 'text-primary');
    allTabsBtn.classList.remove('border-transparent', 'text-gray-500');
    currentTabBtn.classList.remove('border-primary', 'text-primary');
    currentTabBtn.classList.add('border-transparent', 'text-gray-500');
    sessionsBtn.classList.remove('border-primary', 'text-primary');
    sessionsBtn.classList.add('border-transparent', 'text-gray-500');
    
    allTabsView.classList.remove('hidden');
    currentTabView.classList.add('hidden');
    sessionsView.classList.add('hidden');
  });
  
  sessionsBtn.addEventListener('click', () => {
    sessionsBtn.classList.add('border-primary', 'text-primary');
    sessionsBtn.classList.remove('border-transparent', 'text-gray-500');
    currentTabBtn.classList.remove('border-primary', 'text-primary');
    currentTabBtn.classList.add('border-transparent', 'text-gray-500');
    allTabsBtn.classList.remove('border-primary', 'text-primary');
    allTabsBtn.classList.add('border-transparent', 'text-gray-500');
    
    sessionsView.classList.remove('hidden');
    currentTabView.classList.add('hidden');
    allTabsView.classList.add('hidden');
    
    // Hide the session timeline when switching to sessions view
    sessionTimeline.classList.add('hidden');
  });
  
  // Export buttons
  exportPngBtn.addEventListener('click', exportAsPng);
  exportJsonBtn.addEventListener('click', exportAsJson);
  
  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Export dropdown
  exportBtn.addEventListener('click', () => {
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-10';
    dropdown.innerHTML = `
      <div class="py-1">
        <a href="#" id="exportPngDropdown" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PNG</a>
        <a href="#" id="exportJsonDropdown" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as JSON</a>
      </div>
    `;
    
    // Add the dropdown to the DOM
    document.body.appendChild(dropdown);
    
    // Position the dropdown
    const rect = exportBtn.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
    
    // Add event listeners
    dropdown.querySelector('#exportPngDropdown').addEventListener('click', (e) => {
      e.preventDefault();
      exportAsPng();
      document.body.removeChild(dropdown);
    });
    
    dropdown.querySelector('#exportJsonDropdown').addEventListener('click', (e) => {
      e.preventDefault();
      exportAsJson();
      document.body.removeChild(dropdown);
    });
    
    // Close the dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
      if (!dropdown.contains(e.target) && e.target !== exportBtn) {
        document.body.removeChild(dropdown);
        document.removeEventListener('click', closeDropdown);
      }
    });
  });
}
