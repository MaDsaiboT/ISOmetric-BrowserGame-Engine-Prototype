export default class componentSettings extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({mode:'open'});
  }

  async connectedCallback() {
    const shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    //console.log('componentSettings','connected')
    const src = `${location.origin}/html/webComponents/settings.html`;
    shadowRoot.innerHTML = await (await fetch(src)).text()

    const form = shadowRoot.querySelector('form');
    //console.log(form)
  }
}

const tagName = 'component-settings'
if (customElements.get(tagName) === undefined){
  //console.log(`define custom component <${tagName}>`);
  customElements.define(tagName,componentSettings)
}


