"use strict";
export default class componentSettingsAudio extends HTMLElement {

  #html = `
    <component-form-range value="0" min="1" max="100" steps="10" ></component-form-range>
    <span>0</span>
  `;

  #elemContent = null; 

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#elemContent = document.createElement('content');
    let slot = document.createElement('slot');
    this.#elemContent.append(slot);
    this.value = 30;
  }


  async connectedCallback() {
    //console.log('connected audio');
    //this.elemForm = document.createElement('form');
    this.innerHTML = this.#html;


    await this.shadowRoot.append(
      this.#elemContent
    );
  }

  disconnectedCallback() {
    //console.log('disconnected audio');
  }


}

const tagName = 'component-settings-audio';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, componentSettingsAudio);
}
