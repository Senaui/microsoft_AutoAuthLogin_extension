import { LitElement, html, css } from "lit";
import { alertTest, setTOTP, removeTOTP, getAllTOTP, getTOTPByLabel } from "./lib";

// document.addEventListener('DOMContentLoaded', async () => {
//   const label = "microsoft";
//   const secret = {
//     secret: 'lcll2d6xm7t2wvxd',
//     period: 30,
//     url: ''
//   };

//   await setTOTP(label, secret);

//   console.log('Secret set:');


//   const newSecret = await getTOTPByLabel(label);


//   console.log(`New secret set: ${JSON.stringify(newSecret)}`);


//   const newDiv = document.createElement('div');


//   newDiv.innerText = `Secret set: ${JSON.stringify(newSecret)}`;

//   const tokenList = document.getElementById('token-list');

//   tokenList.appendChild(newDiv);
// });

class TotpList extends LitElement {
  static properties = {
    items: { state: true },   // { label: secret }
    filter: { state: true }
  };

  static styles = css`
    :host { display: block; font: 14px/1.4 system-ui, sans-serif; padding: 12px; width: 320px; }
    h1 { font-size: 16px; margin: 0 0 8px; }
    form { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 10px; }
    input { padding: 6px 8px; border: 1px solid #ccc; border-radius: 8px; }
    button { padding: 6px 10px; border: 0; border-radius: 10px; cursor: pointer; }
    button.primary { background: #4f46e5; color: white; }
    ul { list-style: none; padding: 0; margin: 8px 0 0; }
    li { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .muted { color: #6b7280; }
  `;

  constructor() {
    super();
    this.items = {};
    this.filter = "";
    this._onStorageChange = this._onStorageChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.refresh();
    chrome.storage.onChanged.addListener(this._onStorageChange);
  }

  disconnectedCallback() {
    chrome.storage.onChanged.removeListener(this._onStorageChange);
    super.disconnectedCallback();
  }

  async refresh() {
    this.items = await getAllTOTP();
  }

  _onStorageChange(changes, area) {
    if (area === "local" && changes.TOTP) this.refresh();
  }

  async _handleAdd(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const label = form.label.value.trim();
    const secret = form.secret.value.trim();
    if (!label || !secret) return;
    await setTOTP(label, { secret: secret });
    form.reset();
  }

  async _remove(label) {
    await removeTOTP(label);
  }

  render() {
    const entries = Object.entries(this.items)
      .filter(([label]) => label.toLowerCase().includes(this.filter.toLowerCase()));

    return html`
        <h1>TOTP Tokens</h1>
  
        <form @submit=${this._handleAdd}>
          <div class="row">
            <input name="label" placeholder="Label (e.g., example.com)" />
            <input name="secret" placeholder="Secret (base32)" />
          </div>
          <button class="primary" type="submit">Add</button>
        </form>
  
        <input
          placeholder="Filter…"
          @input=${e => (this.filter = e.target.value)}
        />
  
        ${entries.length === 0
        ? html`<p class="muted">No tokens yet.</p>`
        : html`
              <ul>
                ${entries.map(([label, secret]) => html`
                  <li>
                    <div>
                      <div><strong>${label}</strong></div>
                      <div class="muted"><code>${secret.secret.slice(0, 4)}••••••</code></div>
                    </div>
                    <button @click=${() => this._remove(label)}>Delete</button>
                  </li>
                `)}
              </ul>
            `}
      `;
  }


}

// must remove before launching
(async () => {
  const label = "microsoft";
  const secret = { secret: "lcll2d6xm7t2wvxd", period: 30, url: "" };
  await setTOTP(label, secret);
  console.log("seeded");
})();


customElements.define("totp-list", TotpList);

