import { component } from '../_component.js';
import { router } from '../../router.js';

"use strict";
export default class compNavbarUser extends component {

  static #htmlLogedIn = `
    <avatar data-label="DD"></avatar>
    <section>
      <a href="/profile"   data-link >profile</a>
      <a href="/settings"  data-link >settings</a>
      <hr>
      <a href="/logout"    data-link >logout</a>
    </section>
  `;

  static #htmlLogedOut = `
    <a href="/login"  data-link>login</a>
  `;

  static #cssLogedOut = `
    a {
      color: rgba(70,70,70,0.7);
      letter-spacing: 0.5px;
      user-select: none;
      padding: 2px 5px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      font-weight: bold;
      display: block;
      width: 150px ;
      text-align: center;

      transition:
        background       .7s,
        letter-spacing    1s,
        border-bottom    .7s;
    }

    a:hover {
      letter-spacing: 2px;
      font-weight: bolder;
      color: orange !important;
      background: rgba(40,40,40,0.7);
      text-decoration: none;
      transition: 
        color            .8s,
        background       .7s,
        letter-spacing    1s,
        border-bottom    .7s;
    }
  `;

  static #cssLogedIn = `

    :host * {
      box-sizing: border-box;
    }

    avatar {
      margin-left: auto;
      user-select: none;
      font-size: 12;
      font-family: monospace;
      width: 2.5em;
      height: 2.5em;
      background: rgba(90, 90, 90, 0.7);
      color: whitesmoke;
      font-weight: bolder;
      letter-spacing: 2px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0px 0px 4px #222;
      margin-top:   4px;
      margin-right: 10px;
      box-sizing: content-box !important;
      z-index: 6;
    }

    avatar::after{
      content: attr(data-label);
      padding-left: 2px;
      margin-top: -2px;
    }

    nav:hover avatar{
       border: 4px solid #222;
       box-shadow: 0px 0px 0px transparent;
       margin-top:   0;
       margin-right: 6px;
    }

    nav {
      
      display:flex;
      padding: 4px;
      position: absolute;
      right: 10px;
      top: 5px;
    }

    nav:hover {
      padding-bottom: 7px;
      flex-direction: column;
      align-items: center;
      
      width: 155px;
      right: 10px;
      top: 5px;
      z-index: 4;
      pointer-events: auto;
      cursor: pointer;
      border-radius: 7px;
      white-space: nowrap;
      width: 155px;
      background-color: #222;
    }

    nav:hover::after{
      position: absolute;
      right: 0;
      top: 0;
      content: '';
      display: block;
      border-top-right-radius: 7px;
      border-top-left-radius: 7px;
      background-color: #111;
      width: 155px;
      height: 30px;
      z-index: 5;
    }

    nav:hover section{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    section{
      display: none;
    }

    a{
      display: block;
      z-index: 5;
      cursor: pointer;
      position: relative;
    }

    hr{
      width: 100%;
      display: block;
      border: none;
      border-bottom: 2px solid #111;
      opacity: 0.3;
    }
  `;

  #elemStyle   = document.createElement('style');
  #elemContent = document.createElement('nav'); 

  static get observedAttributes() {
    return ["logged-in"];
  }

  constructor() {
    super();
    const self = compNavbarUser;
    this.attachShadow({ mode: 'open' });
    
    //this.#elemStyle.textContent = self.#css;
  }

  async connectedCallback() {
    const self = compNavbarUser;

    if (this.getAttribute('logged-in') === 'true') {
      this.#elemContent.innerHTML = self.#htmlLogedIn;
      this.#elemStyle.textContent  = self.#cssLogedIn;
      this.#elemStyle.textContent += self.#cssLogedOut;
    } 
    else {
      this.#elemContent.innerHTML = self.#htmlLogedOut;
      this.#elemStyle.textContent = self. #cssLogedOut;
    }


    this.#elemContent.querySelectorAll('a[data-link]').forEach(
      e => this.boundEvents.push([e, 'click', this.#onClick])
    );

    while(this.shadowRoot.firstChild) {
      this.shadowRoot.firstChild.remove();
    }

    await this.shadowRoot.append(
      this.#elemStyle,
      this.#elemContent
    );
    super.connectedCallback();
  }

  #onClick(e){
    e.preventDefault();
    e.stopPropagation();
    //console.log(location.href,e.target.href);
    if (location.href !== e.target.href)
      router.navigateTo(e.target.href);
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    //console.log('disconnected Account');
  }


  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logged-in') {
      this.connectedCallback();
    }
  }
}

const tagName = 'comp-navbar-user';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, compNavbarUser);
}
