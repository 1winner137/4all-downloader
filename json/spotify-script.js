// SpotDL Integration - script
// File: ./javascript/spotify-script.js
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
    if (window.spotifyDownloadInjected) {
        return;
    }
    window.spotifyDownloadInjected = true;
    
    console.log('WebView2 Spotify Script: Initializing...');
    
    // Configuration
    const DOWNLOAD_BUTTON_ID = 'webview2-spotify-btn';
    const BUTTON_STYLES = {
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 20px',
        backgroundColor: '#1DB954', // Spotify green
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        userSelect: 'none'
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
    
    // Spotify URL patterns
    const SPOTIFY_PATTERNS = [
        /https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(\?[^\s]*)?/g,
        /https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(\?[^\s]*)?/g,
        /https:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]+(\?[^\s]*)?/g,
        /https:\/\/open\.spotify\.com\/artist\/[a-zA-Z0-9]+(\?[^\s]*)?/g,
        /spotify:track:[a-zA-Z0-9]+/g,
        /spotify:playlist:[a-zA-Z0-9]+/g,
        /spotify:album:[a-zA-Z0-9]+/g,
        /spotify:artist:[a-zA-Z0-9]+/g
    ];
    
    // Create Spotify download button
    function createSpotifyButton() {
        // Check if button already exists
        if (document.getElementById(DOWNLOAD_BUTTON_ID)) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = DOWNLOAD_BUTTON_ID;
        button.innerHTML = '🎵 Spotify';
        button.title = 'Download Spotify tracks/playlists (hold to drag)';
        
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
                this.style.backgroundColor = '#1ed760';
                this.style.transform = 'scale(1.05)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!isDragging) {
                this.style.backgroundColor = '#1DB954';
                this.style.transform = 'scale(1)';
            }
        });
        
        // Click handler - always works unless actively dragging
        button.addEventListener('click', function(e) {
            if (!isDragging && !isHolding) {
                handleSpotifyDownload();
            }
        });
        
        // Add to page
        document.body.appendChild(button);
        console.log('WebView2 Spotify Script: Draggable Spotify button created');
        
        // Update button text with count
        updateButtonCount();
    }
    
    // Extract Spotify URLs from page
    function extractSpotifyUrls() {
        const spotifyUrls = new Set();
        
        // Check all links on the page
        const links = document.querySelectorAll('a[href*="spotify.com"], a[href*="spotify:"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                SPOTIFY_PATTERNS.forEach(pattern => {
                    const matches = href.match(pattern);
                    if (matches) {
                        matches.forEach(match => spotifyUrls.add(match));
                    }
                });
            }
        });
        
        // Also check page content for URLs
        const pageText = document.body.textContent || document.body.innerText || '';
        SPOTIFY_PATTERNS.forEach(pattern => {
            const matches = pageText.match(pattern);
            if (matches) {
                matches.forEach(match => spotifyUrls.add(match));
            }
        });
        
        // Check meta tags and structured data
        const metaTags = document.querySelectorAll('meta[content*="spotify.com"], meta[content*="spotify:"]');
        metaTags.forEach(meta => {
            const content = meta.getAttribute('content');
            if (content) {
                SPOTIFY_PATTERNS.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        matches.forEach(match => spotifyUrls.add(match));
                    }
                });
            }
        });
        
        // Convert Spotify URIs to URLs
        const urlsArray = Array.from(spotifyUrls).map(url => {
            if (url.startsWith('spotify:')) {
                return url.replace('spotify:', 'https://open.spotify.com/').replace(/:/g, '/');
            }
            return url;
        });
        
        return [...new Set(urlsArray)];
    }
    
    // Update button with Spotify URL count
    function updateButtonCount() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const urls = extractSpotifyUrls();
        const count = urls.length;
        
        if (count > 0) {
            button.innerHTML = `🎵 Spotify (${count})`;
            button.style.backgroundColor = '#1DB954';
        } else {
            button.innerHTML = '🎵 Spotify';
            button.style.backgroundColor = '#666';
        }
    }
    
    // Hold-to-drag functionality (same as first script)
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
            console.log('WebView2 Spotify Script: Drag mode activated');
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
    
    // Handle Spotify download button click
    function handleSpotifyDownload() {
        try {
            const currentUrl = window.location.href;
            const pageTitle = document.title || '';
            const spotifyUrls = extractSpotifyUrls();
            
            console.log('WebView2 Spotify Script: Download requested for:', currentUrl);
            console.log('WebView2 Spotify Script: Found Spotify URLs:', spotifyUrls);
            
            if (spotifyUrls.length === 0) {
                showNoSpotifyFeedback();
                return;
            }
            
            // Send each Spotify URL to WebView2 C# code
            spotifyUrls.forEach((spotifyUrl, index) => {
                const downloadData = {
                    url: spotifyUrl,
                    title: `${pageTitle} - Spotify ${index + 1}`,
                    type: 'spotify',
                    tool: 'spotdl'
                };
                
                // Stagger requests to avoid overwhelming
                setTimeout(() => {
                    window.chrome.webview.postMessage(downloadData);
                    console.log('WebView2 Spotify Script: Spotify URL sent to C# handler:', downloadData);
                }, index * 300);
            });
            
            // Visual feedback
            showSpotifyFeedback(spotifyUrls.length);
            
        } catch (error) {
            console.error('WebView2 Spotify Script: Error during Spotify download request:', error);
            showErrorFeedback();
        }
    }
    
    // Show Spotify download started feedback
    function showSpotifyFeedback(count) {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const originalText = button.innerHTML;
        const originalColor = button.style.backgroundColor;
        
        // Change button appearance
        button.innerHTML = `✓ Sent ${count}`;
        button.style.backgroundColor = '#44ff44';
        button.disabled = true;
        
        // Reset after 3 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = originalColor;
            button.disabled = false;
        }, 3000);
    }
    
    // Show no Spotify URLs found feedback
    function showNoSpotifyFeedback() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const originalText = button.innerHTML;
        const originalColor = button.style.backgroundColor;
        
        button.innerHTML = '❌ No URLs';
        button.style.backgroundColor = '#ff9800';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = originalColor;
        }, 2000);
    }
    
    // Show error feedback
    function showErrorFeedback() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (!button) return;
        
        const originalText = button.innerHTML;
        button.innerHTML = '✗ Error';
        button.style.backgroundColor = '#888';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '#1DB954';
        }, 2000);
    }
    
    // Save button position to local memory (not persistent across sessions)
    function saveButtonPosition() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button && window.spotifyButtonPosition) {
            window.spotifyButtonPosition = {
                left: button.style.left,
                top: button.style.top
            };
        }
    }
    
    // Restore button position from memory
    function restoreButtonPosition() {
        const button = document.getElementById(DOWNLOAD_BUTTON_ID);
        if (button && window.spotifyButtonPosition) {
            button.style.left = window.spotifyButtonPosition.left;
            button.style.top = window.spotifyButtonPosition.top;
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        }
    }
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createSpotifyButton();
                restoreButtonPosition();
            });
        } else {
            createSpotifyButton();
            restoreButtonPosition();
        }
        
        // Save position when page unloads
        window.addEventListener('beforeunload', saveButtonPosition);
        
        // Update button count periodically
        setInterval(updateButtonCount, 3000);
        
        console.log('WebView2 Spotify Script: Initialized successfully with drag support');
    }
    
    // Start initialization
    initialize();
    
    // Also listen for dynamic page changes (SPA navigation)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('WebView2 Spotify Script: URL changed to:', window.location.href);
            // URL changed, ensure button exists and update count
            setTimeout(() => {
                createSpotifyButton();
                restoreButtonPosition();
                updateButtonCount();
            }, 1000);
        } else {
            // Page content changed, update count
            updateButtonCount();
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