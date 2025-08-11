import { LitElement, html, css } from "lit";
import { alertTest, setTOTP, removeTOTP, getAllTOTP, getTOTPByLabel } from "./lib";

(async () => {
  const label = "microsoft";
  const secret = { secret: "lcll2d6xm7t2wvxd", period: 30, url: "" };
  await setTOTP(label, secret);
  console.log("seeded");
})();

class ConfirmDelete extends LitElement {
  static properties = {
    label: { type: String },  // optional, for display or event detail
    confirming: { state: true }
  };

  constructor() {
    super();
    this.label = "";
    this.confirming = false;
  }

  static styles = css`
    button { padding: 6px 10px; border: 0; border-radius: 10px; cursor: pointer; }
    .warn    { background: #f59e0b; color: #111; }
    .danger  { background: #ef4444; color: #fff; }
    .secondary { background: #e5e7eb; color: #111; }
    .actions { display: flex; gap: 6px; }
  `;

  _startConfirm() {
    this.confirming = true;
  }
  _cancel() {
    this.confirming = false;
  }
  _confirm() {
    this.confirming = false;
    this.dispatchEvent(new CustomEvent("confirm", {
      detail: { label: this.label },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return this.confirming
      ? html`
          <div class="actions">
            <button class="danger" @click=${this._confirm}>Confirm</button>
            <button class="secondary" @click=${this._cancel}>Cancel</button>
          </div>
        `
      : html`
          <button class="warn" @click=${this._startConfirm}>Delete</button>
        `;
  }
}
customElements.define("confirm-delete", ConfirmDelete);

class TokenItem extends LitElement {
  static properties = {
    label: { type: String },
    value: { attribute: false }, // string or {secret, period, url}
  };
  constructor() {
    super();
    this.label = "";
    this.value = "";
  }
  static styles = css`
    :host { display: list-item; list-style: none; }
    .row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
    .left { display: grid; gap: 2px; }
    strong { font-weight: 600; }
    .muted { color: #6b7280; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  `;
  /** Normalize to the real secret string */
  get secretString() {
    return typeof this.value === "string" ? this.value : (this.value?.secret ?? "");
  }
  _handleConfirm = () => {
    this.dispatchEvent(new CustomEvent("remove", {
      detail: { label: this.label },
      bubbles: true, composed: true
    }));
  };
  render() {
    const token = (this.secretString || "").slice(0, 4);
    return html`
      <li class="row">
        <div class="left">
          <div><strong>${this.label}</strong></div>
          <div class="muted"><code>${token}</code></div>
        </div>
        <confirm-delete .label=${this.label} @confirm=${this._handleConfirm}></confirm-delete>
      </li>
    `;
  }
}
customElements.define("token-item", TokenItem);

class TotpList extends LitElement {
  static properties = {
    items: { state: true },
    filter: { state: true },
  };
  static styles = css`
  :host {
    display: flex;
    flex-direction: column;
    width: 350px;
    max-height: 560px;
    box-sizing: border-box;
    background: #fff;
  }
  .header {
    flex: 0 0 auto;
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .toggle-btn {
    background: none;
    border: none;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    color: #4f46e5;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 12px 12px;
  }
  form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
  input {
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  button {
    padding: 6px 10px;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
  }
  button.primary {
    background: #4f46e5;
    color: white;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  `;


  constructor() {
    super();
    this.items = {};
    this.filter = "";
    this.showForm = false; // start hidden
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
    this.items = (await getAllTOTP()) || {};
  }
  _onStorageChange = (changes, area) => {
    if (area === "local" && changes.TOTP) this.refresh();
  };
  async _handleAdd(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const label = form.label.value.trim();
    const secretInput = form.secret.value.trim();
    if (!label || !secretInput) return;
    // store as object so we can add metadata later
    await setTOTP(label, { secret: secretInput, period: 30, url: "" });
    form.reset();
  }
  async _remove(label) {
    await removeTOTP(label);
  }
  render() {
    const q = this.filter.toLowerCase();
    const entries = Object.entries(this.items || {}).filter(([label]) =>
      label.toLowerCase().includes(q)
    );

    return html`
    <div class="header">
      <div class="title-bar">
        <h1>TOTP Tokens</h1>
        <button class="toggle-btn" @click=${() => this.showForm = !this.showForm}>
          ${this.showForm ? "-" : "+"}
        </button>
      </div>

      ${this.showForm ? html`
        <form @submit=${this._handleAdd}>
          <div class="row">
            <input name="label" placeholder="Label (e.g., example.com)" />
            <input name="secret" placeholder="Secret (base32)" />
          </div>
          <button class="primary" type="submit">Add</button>
        </form>
      ` : ""}

      <input placeholder="Filter…" @input=${e => (this.filter = e.target.value)} />
    </div>

    <div class="list">
      ${entries.length === 0
        ? html`<p class="muted">No tokens yet.</p>`
        : html`
          <ul>
            ${entries.map(([label, value]) => html`
              <token-item
                .label=${label}
                .value=${value}
                @remove=${(e) => this._remove(e.detail.label)}>
              </token-item>
            `)}
          </ul>
        `}
    </div>
  `;
  }


}
customElements.define("totp-list", TotpList);





// must remove before launching




