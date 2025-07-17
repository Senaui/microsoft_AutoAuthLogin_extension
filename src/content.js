import { authenticator } from "otplib";
(async () => {
  console.log('content worked');
  // chrome.action.onClicked.addListener((tab) => {
  //     console.log('Action clicked for tab', tab.id);
  // });
  console.log('content otplib version:', authenticator.generate('xhnw2kpsn2cwyw2j'));
})();
