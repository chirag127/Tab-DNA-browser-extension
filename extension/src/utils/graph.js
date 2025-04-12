import { getDomain } from './formatters';

/**
 * Create a hierarchical structure for D3 from tab data
 * @param {object} tab - Tab data
 * @param {object} allTabs - All tabs data (optional)
 * @returns {object} - Hierarchical structure for D3
 */
export function createHierarchy(tab, allTabs = null) {
  // If allTabs is provided, use it to build the hierarchy
  if (allTabs) {
    const node = {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      creationTime: tab.creationTime,
      domain: getDomain(tab.url),
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
    domain: getDomain(tab.url),
    children: []
  };
}

/**
 * Find the root node of a tab
 * @param {string} tabId - Tab ID
 * @param {object} allTabs - All tabs data
 * @returns {object} - Root tab data
 */
export function findRootNode(tabId, allTabs) {
  let currentTab = allTabs[tabId];
  if (!currentTab) return null;
  
  // Traverse up the tree until we find a tab with no parent
  while (currentTab.parentId && allTabs[currentTab.parentId]) {
    currentTab = allTabs[currentTab.parentId];
  }
  
  return currentTab;
}

/**
 * Find all descendants of a tab
 * @param {string} tabId - Tab ID
 * @param {object} allTabs - All tabs data
 * @returns {array} - Array of descendant tab IDs
 */
export function findDescendants(tabId, allTabs) {
  const descendants = [];
  const tab = allTabs[tabId];
  
  if (!tab || !tab.children || tab.children.length === 0) {
    return descendants;
  }
  
  // Add direct children
  descendants.push(...tab.children);
  
  // Add children's descendants
  tab.children.forEach(childId => {
    descendants.push(...findDescendants(childId, allTabs));
  });
  
  return descendants;
}

/**
 * Calculate the depth of a tab in the hierarchy
 * @param {string} tabId - Tab ID
 * @param {object} allTabs - All tabs data
 * @returns {number} - Depth of the tab
 */
export function calculateDepth(tabId, allTabs) {
  let depth = 0;
  let currentTab = allTabs[tabId];
  
  if (!currentTab) return depth;
  
  // Traverse up the tree and count levels
  while (currentTab.parentId && allTabs[currentTab.parentId]) {
    depth++;
    currentTab = allTabs[currentTab.parentId];
  }
  
  return depth;
}

/**
 * Get a color for a domain
 * @param {string} domain - Domain name
 * @returns {string} - Hex color code
 */
export function getDomainColor(domain) {
  if (!domain) return '#0078ff';
  
  // Simple hash function to generate a color
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Export graph as SVG
 * @param {object} svg - D3 SVG element
 * @returns {string} - SVG string
 */
export function exportAsSvg(svg) {
  const serializer = new XMLSerializer();
  const svgNode = svg.node();
  
  if (!svgNode) return null;
  
  // Clone the SVG to avoid modifying the original
  const clone = svgNode.cloneNode(true);
  
  // Add XML namespace
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .node circle {
      fill: #0078ff;
      stroke: #0057b8;
      stroke-width: 2px;
    }
    .node text {
      font-family: Arial, sans-serif;
      font-size: 12px;
      fill: #333;
    }
    .link {
      fill: none;
      stroke: #ccc;
      stroke-width: 2px;
    }
  `;
  
  clone.insertBefore(style, clone.firstChild);
  
  return serializer.serializeToString(clone);
}
