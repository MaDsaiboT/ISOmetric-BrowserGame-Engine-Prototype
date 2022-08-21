import { math }   from '../../_utils/math.js'; // import our niftly litlle math libary
import { router } from '../router.js';

export default class modalWindow extends HTMLElement {
  static html = `
    <header>
      <slot name="header"></slot>
      <slot name="subHeader"></slot>
      <closer></closer>
    </header>
    <content>
      <slot></slot>
    </content>
    <footer>
      <span>log custom elements</span>
    </footer>
  `;

  static css = `
    :host{
      position: absolute;
      top: 10vh;
      left: calc(50vw - 350px);
      opacity: 0.1;
      transition: transform 0.5s cubic-bezier(0.01, 0.74, 1, 1),
                  opacity   0.5s cubic-bezier(0.01, 0.74, 1, 1);
 
      display: block;
      
      min-width:  700px;
      min-height: 50px;

      user-select: none;
      padding: 10px;
    }

    header{
      display:flex;
      justify-content: space-between;
      align-items: flex-end;
      align-content: center;
      flex-direction: row;

      background: rgba(77,77,77,0.8);
      backdrop-filter: blur(4px) grayscale(0.8);
      padding: 5px 6px;
      border-radius: 4px;
      margin: 0 -2px;

      white-space: nowrap;
    }

    header ::slotted(h3){
      white-space: nowrap;
      display: block;
      background: transparent;
      padding: 0px 0px;
      margin: 0 0;
    }

    header ::slotted(span){
      margin-left: 20px;
      font-size: 0.8rem;
      color: #333;
    }

    closer {
      margin-left: auto;
      display: flex;
      padding: 5px;
      cursor: pointer;
    }

    closer svg{
      display: block;
      color: #333;
      height: 0.8rem;
      transition: color 0.3s;
    }

    closer:hover svg{
      color: #111;
    }

    content{
      min-height: 300px;
      display: block;
      background: rgba( 22, 22, 22, 0.8);
      backdrop-filter: blur(4px) grayscale(0.8);
      color:      rgba(200,200,200, 0.8);
      padding: 15px 15px 5px 15px;
      transition: all 3s ease;
    }

    footer{
      font-size: 0.7rem;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      background: rgba( 22, 22, 22, 0.9);
      backdrop-filter: blur(4px) grayscale(0.8);
      color:      rgba(200,200,200, 0.8);
      padding: 2px 5px;
      min-height: 5px;
      border-bottom-right-radius: 5px;
      border-bottom-left-radius: 5px;
    }

    footer>span{
      cursor: pointer;
    }


  `;

  // private fields
  #closer = null;
  #boundEvents = [];

  #elemDebug = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.offset = { x: 0, y: 0 };
  }

  async connectedCallback() {
    console.log('modalWindow','connected');
    this.style.transform = 'translateY(-100%)';
    this.style.opacity = '0.3';

    const shadowRoot = this.shadowRoot || this.attachShadow({ mode: 'open' });
    //const src_html = `${location.origin}/html/webComponents/test.html`;
    const src_closer_svg = `${location.origin}/img/svg/close-mark.svg`;

    const element_css  = document.createElement('style');
    const element_html = document.createElement('div');

    const closer_svg = await (await fetch(src_closer_svg)).text();

    element_css .innerHTML = modalWindow.css;
    element_html.innerHTML = modalWindow.html;

    await this.shadowRoot.append(element_css, element_html);
    this.#elemDebug = this.shadowRoot.querySelector('footer>span');
    //shadowRoot.innerHTML = modalWindow.html;

    this.#closer = shadowRoot.querySelector('header closer');
    this.#closer.innerHTML = closer_svg;

    this.#boundEvents.push([this, 'transitionend', this.#transitionEnd]);
    this.#boundEvents.push([this.#elemDebug, 'click', this.debug]);
    this.#boundEvents.push([this.#closer, 'click', this.close]);
    //this.#boundEvents.push([this, 'DOMSubtreeModified', this.#onContentChange]);

    //this.mutationObserver = new MutationObserver(this.#onContentChange);

    //this.mutationObserver.observe(this, { childList: true });
    this.#bindEvents();
    this.open();
  }

  #bindEvents() {
    this.#boundEvents.forEach(([element, event, callback]) => {
      element.addEventListener(event, callback.bind(this));
    });
  }

  #unbindEvents() {
    //console.log('#unbindEvents');
    this.#boundEvents.forEach(([element, event, callback]) => {
      element.removeEventListener(event, callback);
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

  #onContentChange(mutationList, observer){
    //console.log('content changed');
    for (const mutation of mutationList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        const list = new Set([...mutation.addedNodes]
          .map(i=>i.nodeName.toLowerCase())
          .filter(n=>n.includes('-')));
       if (!list.size) continue;
       list.forEach(name=>{
        if (!!customElements.get(name)) {
          //console.warn(`no class loaded for customElement <${name}>`);
        }
       });
      }
    }
  }

  debug(){
    const cElems = new Set(Array
    .from(document.querySelectorAll('*'))
    .map(element => element.nodeName.toLowerCase())
    .filter(name => name.includes('-')));
    console.dir(cElems);
    console.dir([...cElems].map(
      name => [name, !!customElements.get(name)]
    ));
  }

  disconnectedCallback() {
    //console.log('disconnectedCallback');
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.#unbindEvents();
    if (location.pathname !== '/') router.navigateTo('/');
  }
}

const tagName = 'modal-window';
if (customElements.get(tagName) === undefined) {
  //console.log(`define custom component <${tagName}>`);
  customElements.define(tagName, modalWindow);
}
