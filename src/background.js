import normalizeUrl from "normalize-url";
import * as lib from "./lib.js";

console.log('Background service worker loaded');

// background.js
const urlRecords = [
    "https://example.com",
    "https://accounts.google.com",
    "https://login.microsoftonline.com//login"
];

const secret = "lcll2d6xm7t2wvxd";

const lastProcessedUrls = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const normalized = normalizeUrl(tab.url);
        if (lastProcessedUrls[tabId] === normalized) {
            // Already handled this URL for this tab, skip
            return;
        }
        lastProcessedUrls[tabId] = normalized; // Mark as processed

        console.log('listener worked');
        console.log('Tab updated:', normalized);
        const match = urlRecords.find(recordUrl => normalized.startsWith(recordUrl));
        if (match) {
            console.log('Tab URL matches a recorded URL:', tab.url);
            chrome.tabs.sendMessage(tabId, {
                type: "SHOW_ALERT",
                payload: { url: normalized }
            });
        }
    }


});




(async () => {
    console.log('Setting secret in background script');
    await lib.setsecret(secret);
    console.log('Secret set:');
    // Schedule TOTP updates every 30 seconds
    lib.scheduleTOTPUpdate(30, async () => {
        const secret = await lib.getsecret();
        if (secret) {
            const totp = lib.generateTotp(secret);
            console.log('Generated TOTP:', totp);
            // Here you can send the TOTP to the content script or handle it as needed
        } else {
            console.error('No secret found for TOTP generation');
        }
    });
})();


