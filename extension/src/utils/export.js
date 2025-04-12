import { saveAs } from 'file-saver';
import { exportAsSvg } from './graph';
import { getAllTabData } from './storage';

/**
 * Export graph as PNG
 * @param {object} svg - D3 SVG element
 * @returns {Promise} - Promise that resolves when the PNG is saved
 */
export function exportAsPng(svg) {
  return new Promise((resolve, reject) => {
    if (!svg) {
      reject(new Error('No SVG element provided'));
      return;
    }
    
    const svgNode = svg.node();
    if (!svgNode) {
      reject(new Error('Invalid SVG element'));
      return;
    }
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode.parentNode);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
      canvas.width = svgNode.parentNode.clientWidth;
      canvas.height = svgNode.parentNode.clientHeight;
      context.drawImage(img, 0, 0);
      
      canvas.toBlob(function(blob) {
        saveAs(blob, 'tab-dna-graph.png');
        resolve();
      });
    };
    
    img.onerror = function(error) {
      reject(error);
    };
    
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  });
}

/**
 * Export graph as SVG
 * @param {object} svg - D3 SVG element
 * @returns {Promise} - Promise that resolves when the SVG is saved
 */
export function exportAsSvgFile(svg) {
  return new Promise((resolve, reject) => {
    if (!svg) {
      reject(new Error('No SVG element provided'));
      return;
    }
    
    const svgString = exportAsSvg(svg);
    if (!svgString) {
      reject(new Error('Failed to generate SVG'));
      return;
    }
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    saveAs(blob, 'tab-dna-graph.svg');
    resolve();
  });
}

/**
 * Export data as JSON
 * @returns {Promise} - Promise that resolves when the JSON is saved
 */
export function exportAsJson() {
  return new Promise((resolve, reject) => {
    getAllTabData()
      .then(data => {
        if (!data) {
          reject(new Error('No data to export'));
          return;
        }
        
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        saveAs(blob, 'tab-dna-data.json');
        resolve();
      })
      .catch(reject);
  });
}

/**
 * Export session as JSON
 * @param {object} session - Session data
 * @returns {Promise} - Promise that resolves when the JSON is saved
 */
export function exportSessionAsJson(session) {
  return new Promise((resolve, reject) => {
    if (!session) {
      reject(new Error('No session data provided'));
      return;
    }
    
    const jsonData = JSON.stringify(session, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Use session date in filename
    const date = new Date(session.startTime);
    const dateStr = date.toISOString().split('T')[0];
    saveAs(blob, `tab-dna-session-${dateStr}.json`);
    resolve();
  });
}
