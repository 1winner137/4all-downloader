// Wait for page to fully load before executing
// 4all-downloader javascrpt this is for education purpose only.
(function() {
    'use strict';
    
    // Configuration - easily modifiable
    const CONFIG = {
        videoSites: ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 'twitch.tv'],
        videoSelectors: ['video', '[data-video]', '.video', '#video'],
        linkSelectors: ['a[href]'],
        downloadButtonId: 'video-downloader-btn',
        overlayId: 'video-downloader-overlay'
    };
    
    let capturedLinks = [];
    let topVideoLink = null;
    
    // Wait for DOM to be ready
    function waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    // Check if URL contains video content
    function isVideoURL(url) {
        if (!url) return false;
        const lowerURL = url.toLowerCase();
        return CONFIG.videoSites.some(site => lowerURL.includes(site)) ||
               lowerURL.includes('watch') ||
               lowerURL.includes('video') ||
               lowerURL.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v)$/i);
    }
    
    // Extract all links from page
    function extractLinks() {
        const links = [];
        const linkElements = document.querySelectorAll(CONFIG.linkSelectors.join(','));
        
        linkElements.forEach(link => {
            const href = link.href;
            if (href && href.startsWith('http')) {
                const linkData = {
                    url: href,
                    text: link.textContent.trim() || link.title || 'No title',
                    isVideo: isVideoURL(href),
                    element: link
                };
                links.push(linkData);
            }
        });
        
        return links;
    }
    
    // Find top video link (first video link found)
    function findTopVideoLink(links) {
        return links.find(link => link.isVideo) || null;
    }
    
    // Create download popup
    function createDownloadPopup() {
        if (!topVideoLink) return;
    
        // Remove existing popup if present
        const existing = document.getElementById(CONFIG.overlayId);
        if (existing) existing.remove();
    
        // Create floating button container
        const fabContainer = document.createElement('div');
        fabContainer.id = CONFIG.overlayId;
        fabContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
        `;
    
        // Create the floating action button (FAB)
        const fabButton = document.createElement('button');
        fabButton.textContent = '⬇ Download';
        fabButton.style.cssText = `
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        `;
    
        fabButton.addEventListener('click', () => {
            // Toggle popup content
            if (fabContainer.querySelector('.popup-content')) {
                fabContainer.querySelector('.popup-content').remove();
                return;
            }
    
            // Create popup content
            const popup = document.createElement('div');
            popup.className = 'popup-content';
            popup.style.cssText = `
                margin-top: 10px;
                background: #333;
                color: white;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                font-size: 14px;
            `;
    
            // Video message
            const msg = document.createElement('div');
            msg.textContent = 'Download this video?';
            popup.appendChild(msg);
    
            // Video title
            const title = document.createElement('div');
            const truncated = topVideoLink.text.length > 50 ? 
                topVideoLink.text.substring(0, 50) + '...' : topVideoLink.text;
            title.textContent = truncated;
            title.style.cssText = 'color: #ccc; margin: 8px 0; font-style: italic; font-size: 12px;';
            popup.appendChild(title);
    
            // Buttons
            const buttonRow = document.createElement('div');
            buttonRow.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-top: 10px;';
    
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.cssText = `
                background: #777;
                color: white;
                border: none;
                padding: 6px 14px;
                border-radius: 5px;
                cursor: pointer;
            `;
            cancelBtn.onclick = () => popup.remove();
    
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Download';
            downloadBtn.style.cssText = `
                background: #2196F3;
                color: white;
                border: none;
                padding: 6px 14px;
                border-radius: 5px;
                cursor: pointer;
            `;
            downloadBtn.onclick = () => {
                // Use proper pywebview API call
                if (window.pywebview && window.pywebview.api && window.pywebview.api.print_download_link) {
                    console.log('Calling pywebview API with:', topVideoLink.url);
                    window.pywebview.api.print_download_link(topVideoLink.url);
                    fabContainer.remove();
                } else {
                    console.error('pywebview API not available');
                    alert('Error: Python API not available');
                }
            };
    
            buttonRow.appendChild(cancelBtn);
            buttonRow.appendChild(downloadBtn);
            popup.appendChild(buttonRow);
    
            fabContainer.appendChild(popup);
        });
    
        fabContainer.appendChild(fabButton);
        document.body.appendChild(fabContainer);
    }
        
    
    // Main scanning function
    function scanForLinks() {
        capturedLinks = extractLinks();
        topVideoLink = findTopVideoLink(capturedLinks);
        
        // Log results for debugging
        console.log('Total links found:', capturedLinks.length);
        console.log('Video links found:', capturedLinks.filter(l => l.isVideo).length);
        if (topVideoLink) {
            console.log('Top video link:', topVideoLink.url);
        }
        
        // Show popup if video found
        if (topVideoLink) {
            createDownloadPopup();
        }
    }
    
    // Initialize when DOM is ready
    waitForDOM().then(() => {
        // Wait a bit more for dynamic content
        setTimeout(() => {
            scanForLinks();
            
            // Scan periodically for sites with heavy dynamic content
            setInterval(scanForLinks, 3000);
        }, 1000);
    });
    
    // Expose functions for external access if needed
    window.videoCapture = {
        scan: scanForLinks,
        getLinks: () => capturedLinks,
        getTopVideo: () => topVideoLink,
        config: CONFIG
    };
    
})();
