// This script adds video download and enhancement features
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


console.log('Video Enhancement Script Loaded!');

// Function to find and enhance video elements
function enhanceVideos() {
    const videos = document.querySelectorAll('video');
    const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".avi"], a[href*=".mov"], a[href*=".webm"], a[href*=".mkv"]');
    
    // Enhance video elements
    videos.forEach((video, index) => {
        // Add custom controls if not present
        if (!video.hasAttribute('controls')) {
            video.setAttribute('controls', 'true');
        }
        
        // Add download button for each video
        if (!video.parentElement.querySelector('.video-download-btn')) {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'video-download-btn';
            downloadBtn.textContent = '⬇ Download Video';
            downloadBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                z-index: 1000;
            `;
            
            downloadBtn.onclick = function() {
                const videoSrc = video.currentSrc || video.src;
                if (videoSrc) {
                    try {
                        window.chrome.webview.postMessage({
                            url: videoSrc,
                            title: document.title || 'Video Download'
                        });
                        console.log('Video download triggered:', videoSrc);
                    } catch (error) {
                        console.error('Error sending video download message:', error);
                        alert('Download request failed');
                    }
                } else {
                    alert('No video source found');
                }
            };
            
            // Position video container relatively
            if (video.parentElement.style.position !== 'relative') {
                video.parentElement.style.position = 'relative';
            }
            
            video.parentElement.appendChild(downloadBtn);
        }
        
        console.log(`Enhanced video ${index + 1}:`, video.src);
    });
    
    // Highlight video download links
    videoLinks.forEach(link => {
        if (!link.classList.contains('video-link-enhanced')) {
            link.classList.add('video-link-enhanced');
            link.style.cssText += `
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
                color: white !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
                text-decoration: none !important;
                font-weight: bold !important;
            `;
            
            // Add video icon
            const videoIcon = document.createElement('span');
            videoIcon.innerHTML = '🎥 ';
            link.prepend(videoIcon);
            
            link.title = 'Video Download Link - Click to download';
        }
    });
    
    console.log(`Found and enhanced ${videos.length} videos and ${videoLinks.length} video links`);
}

// Function to add video control panel
function addVideoControlPanel() {
    // Remove existing panel if present
    const existingPanel = document.getElementById('video-control-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    const panel = document.createElement('div');
    panel.id = 'video-control-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 10000;
        min-width: 250px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;
    
    const videoCount = document.querySelectorAll('video').length;
    const videoLinkCount = document.querySelectorAll('a[href*=".mp4"], a[href*=".avi"], a[href*=".mov"], a[href*=".webm"], a[href*=".mkv"]').length;
    
    panel.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #ff6b6b;">🎥 Video Controls</h4>
        <div style="margin-bottom: 10px;">
            <small>Videos found: ${videoCount} | Links: ${videoLinkCount}</small>
        </div>
        <button onclick="enhanceAllVideos()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #4CAF50;">Enhance Videos</button>
        <button onclick="downloadAllVideos()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #2196F3;">Download All</button>
        <br>
        <button onclick="toggleVideoSpeeds()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #FF9800;">Speed Controls</button>
        <button onclick="fullscreenAllVideos()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #9C27B0;">Fullscreen</button>
        <br>
        <button onclick="removeVideoPanel()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #f44336;">Close Panel</button>
    `;
    
    document.body.appendChild(panel);
}

// Function to download all videos on the page
function downloadAllVideos() {
    const videos = document.querySelectorAll('video');
    const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".avi"], a[href*=".mov"], a[href*=".webm"], a[href*=".mkv"]');
    
    // Download video elements
    // Download video elements
    videos.forEach((video, index) => {
        const videoSrc = video.currentSrc || video.src;
        if (videoSrc) {
            setTimeout(() => {
                try {
                    window.chrome.webview.postMessage({
                        url: videoSrc,
                        title: document.title || `Video ${index + 1}`
                    });
                    console.log(`Downloading video ${index + 1}:`, videoSrc);
                } catch (error) {
                    console.error(`Error downloading video ${index + 1}:`, error);
                }
            }, index * 1000); // Stagger downloads
        }
    });

    // Download video links
    videoLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href) {
            setTimeout(() => {
                try {
                    window.chrome.webview.postMessage({
                        url: href,
                        title: document.title || `Video Link ${index + 1}`
                    });
                    console.log(`Downloading video link ${index + 1}:`, href);
                } catch (error) {
                    console.error(`Error downloading video link ${index + 1}:`, error);
                }
            }, (videos.length + index) * 1000);
        }
    });
    const totalCount = videos.length + videoLinks.length;
    if (totalCount > 0) {
        alert(`Started downloading ${totalCount} videos. Check download manager for progress.`);
    } else {
        alert('No videos found on this page.');
    }
}

// Function to add speed controls to videos
function toggleVideoSpeeds() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Remove existing speed control if present
        const existingControl = video.parentElement.querySelector('.speed-control');
        if (existingControl) {
            existingControl.remove();
            return;
        }
        
        // Create speed control
        const speedControl = document.createElement('div');
        speedControl.className = 'speed-control';
        speedControl.style.cssText = `
            position: absolute;
            top: 50px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 5px;
            border-radius: 4px;
            z-index: 1001;
        `;
        
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        speeds.forEach(speed => {
            const btn = document.createElement('button');
            btn.textContent = `${speed}x`;
            btn.style.cssText = `
                margin: 2px;
                padding: 3px 6px;
                background: ${speed === 1 ? '#4CAF50' : '#555'};
                color: white;
                border: none;
                border-radius: 2px;
                cursor: pointer;
                font-size: 10px;
            `;
            
            btn.onclick = function() {
                video.playbackRate = speed;
                // Update button styles
                speedControl.querySelectorAll('button').forEach(b => {
                    b.style.background = '#555';
                });
                btn.style.background = '#4CAF50';
                console.log(`Video speed set to ${speed}x`);
            };
            
            speedControl.appendChild(btn);
        });
        
        video.parentElement.appendChild(speedControl);
    });
}

// Function to toggle fullscreen for videos
function fullscreenAllVideos() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach((video, index) => {
        // Add fullscreen button if not present
        if (!video.parentElement.querySelector('.fullscreen-btn')) {
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'fullscreen-btn';
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.style.cssText = `
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                z-index: 1000;
            `;
            
            fullscreenBtn.onclick = function() {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                }
            };
            
            video.parentElement.appendChild(fullscreenBtn);
        }
    });
    
    console.log(`Added fullscreen controls to ${videos.length} videos`);
}

// Function to remove video panel
function removeVideoPanel() {
    const panel = document.getElementById('video-control-panel');
    if (panel) {
        panel.remove();
    }
}

// Initialize video enhancements
function initVideoEnhancements() {
    enhanceVideos();
    addVideoControlPanel();
    
    // Add keyboard shortcuts for video controls
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            const panel = document.getElementById('video-control-panel');
            if (panel) {
                removeVideoPanel();
            } else {
                addVideoControlPanel();
            }
        }
        
        if (e.ctrlKey && e.key === 'd' && e.shiftKey) {
            e.preventDefault();
            downloadAllVideos();
        }
    });
    
    console.log('Video enhancements initialized! Press Ctrl+V to toggle panel, Ctrl+Shift+D to download all videos');
}

// Make functions globally available
window.enhanceAllVideos = enhanceVideos;
window.downloadAllVideos = downloadAllVideos;
window.toggleVideoSpeeds = toggleVideoSpeeds;
window.fullscreenAllVideos = fullscreenAllVideos;
window.removeVideoPanel = removeVideoPanel;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoEnhancements);
} else {
    initVideoEnhancements();
}

// Re-enhance videos when new content is loaded (for dynamic pages)
const observer = new MutationObserver(function(mutations) {
    let shouldEnhance = false;
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && (node.tagName === 'VIDEO' || node.querySelector('video'))) {
                    shouldEnhance = true;
                }
            });
        }
    });
    
    if (shouldEnhance) {
        setTimeout(enhanceVideos, 1000);
    }
});

observer.observe(document.body, { childList: true, subtree: true });
