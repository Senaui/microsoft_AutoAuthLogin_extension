import { authenticator } from "otplib";

totpItem = {
    secret: 'AAA',
    label: 'Google',
    period: 30,
    url: ''
}


export const generateTotp = (secret) => {
    return authenticator.generate(secret);
}

export const setsecret = async (secret) => {
    console.log('Setting secret:', secret);
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ secret }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log('Secret saved to storage');
                resolve();
            }
        });
    });
}

export const setItem = async (key, value) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log('Item saved to storage');
                resolve();
            }
        });
    });
}

export const getItem = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result[key]) {
                resolve(result[key]);
            } else {
                resolve(null);
            }
        });
    });
}

export const getsecret = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['secret'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.secret) {
                resolve(result.secret);
            } else {
                resolve(null);
            }
        });
    });
};


export const alertTest = () => {
    alert('Test alert from lib.js');
}

export const activate = () => {
    console.log('activate function called from lib.js');
    // Additional activation logic can be added here
}

export const getSecondsRemaining = (interval = 30) => {
    const now = Math.floor(Date.now() / 1000);
    return interval - (now % interval);
}

export const scheduleTOTPUpdate = (interval = 30, updateCallback) => {
    // Initial call to set up the first update
    updateCallback();
    function tick() {
        const remaining = getSecondsRemaining(interval);
        console.log('Seconds remaining until next TOTP update:', remaining);
        if (remaining === interval) {
            updateCallback(); // Time window just rolled over: update TOTP!
        }
        setTimeout(tick, 1000); // Check every 1 second
    }
    tick();
}

