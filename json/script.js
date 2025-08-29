// 4allDownloader - script
// WebView2 Draggable Clean Download Button Injector - No Cookies in Message
// 4allDowbloader&converter - script
// File: ./javascript/video.js
//  * 4allDownloader & Converter - [Script Name]
//  * Copyright (c) 2025 4allDownloader & Converter
//  * 
//  * This script is part of 4allDownloader & Converter application.
//  * All rights reserved. Unauthorized copying, distribution, or modification
//  * of this software is strictly prohibited.
//  * 
//  * Version: 1.0
//  * Created: 8/29/2025
//  * 
//  * For support and updates, visit: 4alldownloader&converter

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.browserDownloadInjected) {
        return;
    }
    window.browserDownloadInjected = true;
    
    console.log('WebView2 Download Script: Initializing...');
    
    // Configuration
    const DOWNLOAD_BUTTON_ID = 'webview2-download-btn';
    const BUTTON_STYLES = {
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 20px',
        backgroundColor: '#ff4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer', // Normal pointer cursor
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        userSelect: 'none' // Prevent text selection during drag
    };
    
    // Dragging state
    let isDragging = false;
    let isHolding = false;
    let holdTimer = null;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;
    const HOLD_DURATION = 500; // 500ms hold to start dragging
    
    // Create download button
    function createDownloadButton() {
        // Check if button already exists
        if (document.getElementById(DOWNLOAD_BUTTON_ID)) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = DOWNLOAD_BUTTON_ID;
        button.textContent = '⬇ Download';
        button.title = 'Download current page content (hold to drag)';
        
        // Apply styles
        Object.assign(button.style, BUTTON_STYLES);
        
        // Add hold-to-drag event listeners
        button.addEventListener('mousedown', startHold);
        button.addEventListener('mouseup', endHold);
        button.addEventListener('mouseleave', endHold);
        document.addEventListener('mousemove', drag);
        
        // Touch events for mobile
        button.addEventListener('touchstart', startHold);
        button.addEventListener('touchend', endHold);
        document.addEventListener('touchmove', drag);
        
        // Hover effects (only when not dragging)
        button.addEventListener('mouseenter', function() {
            if (!isDragging) {
                this.style.backgroundColor = '#ff6666';
                this.style.transform = 'scale(1.05)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!isDragging) {
                this.style.backgroundColor = '#ff4444';
                this.style.transform = 'scale(1)';
            }
        });
        
        // Click handler - always works unless actively dragging
        button.addEventListener('click', function(e) {
            if (!isDragging && !isHolding) {
                handleDownloadClick();
            }
        });
        
        // Add to page
        document.body.appendChild(button);
        console.log('WebView2 Download Script: Draggable download button created');
    }
    
    // Hold-to-drag functionality
    function startHold(e) {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button || e.target !== button) return;
        
        isHolding = true;
        
        // Store initial mouse/touch position
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        // Start hold timer
        holdTimer = setTimeout(() => {
            if (isHolding) {
                startDragging();
            }
        }, HOLD_DURATION);
        
        // Visual feedback for holding
        setTimeout(() => {
            if (isHolding && !isDragging) {
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.8';
            }
        }, 100);
    }
    
    function endHold(e) {
        isHolding = false;
        
        // Clear hold timer
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button && !isDragging) {
            // Reset visual feedback
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
        
        // End dragging if active
        if (isDragging) {
            endDragging();
        }
    }
    
    function startDragging() {
        isDragging = true;
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button) {
            button.style.transition = 'none';
            button.style.cursor = 'grabbing';
            button.style.transform = 'scale(1.05)';
            button.style.opacity = '0.9';
            console.log('WebView2 Download Script: Drag mode activated');
        }
    }
    
    function endDragging() {
        isDragging = false;
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button) {
            button.style.transition = 'all 0.3s ease';
            button.style.cursor = 'pointer';
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
        }
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            xOffset = currentX;
            yOffset = currentY;
            
            const button = document.getElementById(DOWNLOAD_BUTTON_ID);
            if (button) {
                // Convert fixed position to absolute for dragging
                button.style.position = 'fixed';
                button.style.left = (currentX) + 'px';
                button.style.top = (currentY) + 'px';
                button.style.right = 'auto';
                button.style.bottom = 'auto';
                
                // Keep button within viewport
                const rect = button.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                let newLeft = currentX;
                let newTop = currentY;
                
                // Boundary checks
                if (rect.left < 0) newLeft = 0;
                if (rect.right > viewportWidth) newLeft = viewportWidth - rect.width;
                if (rect.top < 0) newTop = 0;
                if (rect.bottom > viewportHeight) newTop = viewportHeight - rect.height;
                
                button.style.left = newLeft + 'px';
                button.style.top = newTop + 'px';
                
                xOffset = newLeft;
                yOffset = newTop;
            }
        }
    }
    
    function dragEnd(e) {
        if (isDragging) {
            const button = document.getElementById(DOWNLOAD_BUTTON_ID);
            if (button) {
                button.style.transition = 'all 0.3s ease'; // Re-enable transition
                button.style.cursor = 'move';
            }
            
            // Small delay before allowing clicks to prevent accidental download
            setTimeout(() => {
                isDragging = false;
            }, 100);
        }
    }
    
    // Handle download button click - CLEAN MESSAGE (NO COOKIES)
    function handleDownloadClick() {
        try {
            const currentUrl = window.location.href;
            const pageTitle = document.title || '';
            
            console.log('WebView2 Download Script: Download requested for:', currentUrl);
            console.log('WebView2 Download Script: Page title:', pageTitle);
            
            // Prepare clean download data - NO COOKIES
            const downloadData = {
                url: currentUrl,
                title: pageTitle
                // Cookies removed - handled by C# native cookie manager
            };
            
            // Send clean message to WebView2 C# code
            window.chrome.webview.postMessage(downloadData);
            console.log('WebView2 Download Script: Clean message sent to C# handler:', downloadData);
            
            // Visual feedback
            showDownloadFeedback();
            
        } catch (error) {
            console.error('WebView2 Download Script: Error during download request:', error);
            showErrorFeedback();
        }
    }
    
    // Show download started feedback
    function showDownloadFeedback() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const originalText = button.textContent;
        const originalColor = button.style.backgroundColor;
        
        // Change button appearance
        button.textContent = '✓ Requested';
        button.style.backgroundColor = '#44ff44';
        button.disabled = true;
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = originalColor;
            button.disabled = false;
        }, 2000);
    }
    
    // Show error feedback
    function showErrorFeedback() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const originalText = button.textContent;
        button.textContent = '✗ Error';
        button.style.backgroundColor = '#888';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '#ff4444';
        }, 2000);
    }
    
    // Save button position to local memory (not persistent across sessions)
    function saveButtonPosition() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button && window.buttonPosition) {
            window.buttonPosition = {
                left: button.style.left,
                top: button.style.top
            };
        }
    }
    
    // Restore button position from memory
    function restoreButtonPosition() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button && window.buttonPosition) {
            button.style.left = window.buttonPosition.left;
            button.style.top = window.buttonPosition.top;
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        }
    }
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createDownloadButton();
                restoreButtonPosition();
            });
        } else {
            createDownloadButton();
            restoreButtonPosition();
        }
        
        // Save position when page unloads
        window.addEventListener('beforeunload', saveButtonPosition);
        
        console.log('WebView2 Download Script: Initialized successfully with drag support');
    }
    
    // Start initialization
    initialize();
    
    // Also listen for dynamic page changes (SPA navigation)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('WebView2 Download Script: URL changed to:', window.location.href);
            // URL changed, ensure button exists
            setTimeout(() => {
                createDownloadButton();
                restoreButtonPosition();
            }, 1000);
        }
    });
    
    // Start observing after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }, 1000);
    
})();