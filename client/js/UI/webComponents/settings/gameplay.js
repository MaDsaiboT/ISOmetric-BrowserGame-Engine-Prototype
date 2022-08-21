"use strict";
export default class componentSettingsGameplay extends HTMLElement {
  static #css = `
    :host{

    }

    ::slotted(h4) {
      margin: 0 0 10px 0; 
    }
  `;

  value = 10;

  #html = this.#parse`testing ${'value'} a value`;

  #elemStyle = null;
  #elemContent = null; 
 
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#elemStyle   = document.createElement('style');
    this.#elemContent = document.createElement('content');

    this.#elemStyle.textContent = componentSettingsGameplay.#css;

    let slot = document.createElement('slot');
    this.#elemContent.append(slot);
  }


  async connectedCallback() {
    //console.log('connected Gameplay');
    this.innerHTML = this.#html;

    await this.shadowRoot.append(
      this.#elemStyle,
      this.#elemContent
    );
  }

  disconnectedCallback() {
    //console.log('disconnected Gameplay');
  }

  #parse(strings, ...expressions) {
    console.log(strings);
    console.log(expressions);
    return expressions.reduce((acc, exp, idx) => {
      return acc + (this?.[exp] || exp) + strings[idx + 1];
    },strings[0]);
  }

}

const tagName = 'component-settings-gameplay';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, componentSettingsGameplay);
}
