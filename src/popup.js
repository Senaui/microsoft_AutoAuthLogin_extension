import { alertTest, setTOTP, getTOTPByKey } from "./lib";
import { html, render } from 'lit-html';

document.getElementById('myButton').addEventListener('click', async () => {
  const label = "microsoft";
  const secret = {
    secret: 'lcll2d6xm7t2wvxd',
    period: 30,
    url: ''
  };
  alertTest();

  await setTOTP(label, secret);

  console.log('Secret set:');


  const newSecret = await getTOTPByKey(label);


  console.log(`New secret set: ${JSON.stringify(newSecret)}`);


  const newDiv = document.createElement('div');


  newDiv.innerText = `Secret set: ${JSON.stringify(newSecret)}`;

  const tokenList = document.getElementById('token-list');
  tokenList.appendChild(newDiv);
});

document.addEventListener('DOMContentLoaded', async () => {
  const label = "microsoft";
  const secret = {
    secret: 'lcll2d6xm7t2wvxd',
    period: 30,
    url: ''
  };

  await setTOTP(label, secret);

  console.log('Secret set:');


  const newSecret = await getTOTPByKey(label);


  console.log(`New secret set: ${JSON.stringify(newSecret)}`);


  const newDiv = document.createElement('div');


  newDiv.innerText = `Secret set: ${JSON.stringify(newSecret)}`;

  const tokenList = document.getElementById('token-list');
  
  tokenList.appendChild(newDiv);
});