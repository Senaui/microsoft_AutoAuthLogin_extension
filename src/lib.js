import { authenticator } from "otplib";

export function generateTotp(secret) {
    return authenticator.generate(secret);
}

export async function setItem(key, value) {
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

export async function getItem(key) {
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

export async function setTOTP(label, secret) {
    console.log('Setting TOTP secret:', secret);
    return new Promise(async (resolve, reject) => {
        const existingTOTPs = await getItem('TOTP');
        existingTOTPs[label] = secret;
        await setItem('TOTP', existingTOTPs);
        console.log('Secret added to storage');
        resolve();
    });
}

export async function removeTOTP(label) {
    console.log('Removing TOTP secret for label:', label);
    return new Promise(async (resolve, reject) => {
        const existingTOTPs = await getItem('TOTP');
        delete existingTOTPs[label];
        await setItem('TOTP', existingTOTPs);
        console.log('Secret removed from storage');
        resolve();
    });
}

export async function getAllTOTP() {
    return await getItem('TOTP') ? getItem('TOTP') : {};
}

export async function getTOTPByLabel(label) {
    const allTOTPs = await getAllTOTP();
    return allTOTPs ? allTOTPs[label] || null : null;
}

export async function alertTest() {
    alert('Test alert from lib.js');
}

export async function activate() {
    console.log('activate function called from lib.js');
}

export async function getSecondsRemaining(interval = 30) {
    const now = Math.floor(Date.now() / 1000);
    return interval - (now % interval);
}

export async function scheduleTOTPUpdate(interval = 30, updateCallback) {
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

