"use strict";
export default class componentSettingsGraphics extends HTMLElement {


  #elemContent = null; 

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#elemContent = document.createElement('content');
    
    let slot = document.createElement('slot');
    this.#elemContent.append(slot);
  }


  async connectedCallback() {
    //console.log('connected Graphics');
    this.innerHTML = '<h4>Graphics</h4>';


    await this.shadowRoot.append(
      this.#elemContent
    );
  }

  disconnectedCallback() {
    //console.log('disconnected Graphics');
  }

}

const tagName = 'component-settings-graphics';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, componentSettingsGraphics);
}
