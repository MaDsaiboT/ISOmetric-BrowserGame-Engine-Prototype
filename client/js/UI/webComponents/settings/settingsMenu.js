"use strict";
import { router }    from '/js/UI/router.js';
import { component } from '/js/UI/webComponents/_component.js';

export default class componentSettings extends component {
  static layout = ``;

  static css = `
    :host{
      display: grid;
      grid-template-columns:
        150px auto;
      grid-template-rows:
        460px 32px;
      grid-template-areas:
        'menu content'
        'footer footer';
      gap: 10px;
      height: 100%;
    }

    header {
      grid-area: header;
      border-bottom: 3px solid rgba(77,77,77,0.1);
    }

    nav {
      grid-area: menu;
      padding-top:10px;
      display: flex;
      flex-direction: column;
      border-right: 3px solid rgba(77,77,77,0.6);
    }

    nav a{
      margin-right: -3px;
      margin-bottom: 5px;
      padding: 5px 17px;
      text-decoration: none;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      font-weight: 500;
      color: #aaa;
    }

    nav a:hover{
      font-weight: 600;
      color: #ccc;
      background: rgba(77,77,77,0.3);
    }

    nav a.active{
      background: rgba(255,165,0,0.3);
      color: #111;
      font-weight: 700;
    }

    content{
      grid-area: content;
      padding: 5px;
    }

    h1, h2, h3, h4{
      margin: 0 0 10px 0;
    }

    footer {
      text-align: right;
      line-height: 32px;
      grid-area: footer;
      border-top: 3px solid rgba(77,77,77,0.1);
    }
  `;

  static #categories = [
    'gameplay', 
    'account', 
    'graphics', 
    'audio'
  ];

  #elemStyle   = null;
  #elemMenu    = null;
  #elemContent = null;
  #elemFooter  = null;

  #boundEvents = [];

  #activeCategory = null;

  static get observedAttributes() {
    return ['category'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#elemStyle   = document.createElement('style');
    this.#elemMenu    = document.createElement('nav');
    this.#elemContent = document.createElement('content');
    this.#elemFooter  = document.createElement('footer');

    let slot = document.createElement('slot');
    this.#elemContent.append(slot);

    this.#createMenu();
    this.boundEvents.push([this.#elemMenu,'click',this.#onClickMenu]);
  }

  connectedCallback() {
    const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });

    this.#elemStyle.innerHTML = componentSettings.css;
    
    this.shadowRoot.append(
      this.#elemStyle, 
      this.#elemMenu, 
      this.#elemContent,
      this.#elemFooter
    );

    super.connectedCallback();
    //const [element, event, callback] = this.#boundEvents[0];
    //this.#elemMenu.addEventListener(event, callback);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (location.pathname !== '/') router.navigateTo('/');
  }

  #getCategoryFromUrl(url) {
    url = new URL(url, location.origin);
    return url.pathname.trim().split('/').at(-1);
  }

  #onClickMenu(e) {
    //console.log('onClickMenu',e.target);
    e.preventDefault();
    e.stopPropagation();
    if (!e.target.matches('a')) return;
    if (this.#getCategoryFromUrl(e.target.href) === this.#activeCategory) return;

    //console.log(e.target);
    this.#clearContent();
    router.navigateTo(e.target.href);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (newVal === this.#activeCategory) return;

    if (['undefined', null, undefined].includes(newVal)) {
      router.navigateTo(`/settings/${componentSettings.#categories[0]}`);
      return;
    }

    //console.log('category', {oldVal, newVal});

    switch (name) {
      case 'category':
        if (componentSettings.#categories.includes(newVal)) {
          this.#activeCategory = newVal;
          this.#updateMenu();
          this.#updateContent();
        }
        break;
    }
  }

  #updateMenu() {
    componentSettings.#categories.forEach(cat => {
      const item = this.#elemMenu.querySelector(`a[href="/settings/${cat}"]`);
      //console.log(cat,item);
      if (cat === this.#activeCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  #clearContent() {
    while (this.firstChild) this.firstChild.remove();
  }

  async #updateContent() {
    //console.log('#updateContent');
    const cat = this.#activeCategory;
    const tagName = `component-settings-${cat}`;
    
    if (customElements.get(tagName) === undefined) {
      await import(`/js/UI/webComponents/settings/${cat}.js`);
    } 
    this.#clearContent();
    this.append(document.createElement(tagName));
    //this.#elemContent.innerHTML = '';
    //this.#elemContent.innerHTML += `<h1>${this.#activeCategory}</h1>`;
  }

  #createMenu() {
    this.#elemMenu.innerHTML = '';
    componentSettings.#categories.forEach(cat => {
      this.#elemMenu.innerHTML += `<a href="/settings/${cat}" data-link>${cat}</a>`;
    });
  }

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const tagName = 'component-settings';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, componentSettings);
}
