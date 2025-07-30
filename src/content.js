import { authenticator } from "otplib";

(() => {

  console.log('content worked');
  console.log('content otplib version:', authenticator.generate('xhnw2kpsn2cwyw2j'));

  function autofillLogin({ username, password }) {
    const userField =
      document.querySelector('input[type="email"], input[name="username"], input[name="email"], input#username, input#email');
    const passField =
      document.querySelector('input[type="password"], input[name="password"], input#password');
    if (userField) {
      userField.value = username;
      userField.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (passField) {
      passField.value = password;
      passField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTOFILL_LOGIN") {
      autofillLogin(message.payload);
      sendResponse({ status: "filled" });
    }
  });
  
})();



