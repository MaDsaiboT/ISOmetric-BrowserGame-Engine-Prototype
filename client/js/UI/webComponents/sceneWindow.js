import { component } from './_component.js';
import { iGame } from '../../GAME/Game.js';

class compSceneWindow extends component {
  
  static #html = `
    <header></header>
    <content>
      <slot></slot>
    </content>
  `;

  static #css = `
    :host{
      --width: 530px;

      width: var(--width);

      position: absolute;
      top: 10vh;
      left: calc(50vw - (var(--width) * 0.5));

      padding: 5px;
     
      color: #eee;
      font-size: 2.5rem;

      display: flex;
      flex-direction: column;
      transform: translateX(-10%);
      transition: transform .5s ease-out;
    }

    :host{
      user-select: none;
    }

    header{
      display: block;
      min-height: 1rem;
      background: #333;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      border-radius: 7px;
      padding: 5px 15px;
      margin-left: -5px;
      margin-right: -5px;
      z-index: 2;

      color: rgba(250,250,250,0.6);
      font-size: 1rem;
    }

    content{
      min-height: 200px;
      background: #222;

      border-top: none;
      border-bottom-left-radius: 7px;
      border-bottom-right-radius: 21px;

      box-shadow: rgba(0, 0, 0, 0.32) 0px 3px 8px;
      padding: 10px;
      z-index: 1;
    }
  `;

  constructor() {
    super();
    const self = compSceneWindow;
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = self.#css;
    this.shadowRoot.append(style);
    this.shadowRoot.innerHTML += self.#html;
    this.header = this.shadowRoot.querySelector('header');

    const subID = iGame.states.subscribe('scene-select','scene',(newVal, oldVal) => {
      console.log(`remove subscription ${subID}`);
      iGame.states.unsubscribe(subID);
      this.close();
    });
  }

  #transitionEnd() {
    //console.log('transitionEnd');
    if (this.closed) this.remove();
  }

  open() {
    //console.log('open');
    this.style.transform = 'translateY(0%)';
    this.style.opacity   = '1';
  }

  close() {
    this.closed = true;
    this.style.transform = 'translateY(-100%)';
    this.style.opacity   = '0.3';
  }

  set title(str){
    this.header.textContent = str;
  }

  connectedCallback() {
    this.boundEvents.push([this,'transitionend',this.#transitionEnd]);
    super.connectedCallback();
    this.open();
  }

  disconnectedCallback(){
    super.connectedCallback();
  }
}

const tagName = 'scene-window';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, compSceneWindow);
}
