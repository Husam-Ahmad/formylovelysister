// background.js
// Badge shows extension is active. Supports Chrome and Edge.

var browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

browserAPI.action.setBadgeText({ text: 'ON' });
browserAPI.action.setBadgeBackgroundColor({ color: '#28a745' });
