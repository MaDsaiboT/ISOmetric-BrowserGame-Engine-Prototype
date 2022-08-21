"use strict";
export default class componentSettingsAccount extends HTMLElement {


  #elemContent = null; 

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#elemContent = document.createElement('content');
    let slot = document.createElement('slot');
    this.#elemContent.append(slot);
  }


  async connectedCallback() {
    //console.log('connected Account');
    this.innerHTML = '<h4>Account</h4>';


    
    //const form = shadowRoot.querySelector('form');
    //console.log(form)

    await this.shadowRoot.append(
      this.#elemContent
    );
  }

  disconnectedCallback() {
    //console.log('disconnected Account');
  }


}

const tagName = 'component-settings-account';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, componentSettingsAccount);
}
