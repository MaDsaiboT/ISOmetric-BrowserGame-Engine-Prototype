import { component } from './_component.js';
import { iGame } from '../../GAME/Game.js';

class compSceneSelect extends component {

  static #css = `
    content {
      margin: 0 0;
      padding: 0 0;
      display: flex;
      flex-wrap: wrap;
    }

    card {
      display: grid;
      background: rgba(0,0,0,0.26);
      grid-template-columns:
        64px auto;
      grid-template-rows:
        calc(1.2rem + 2px) auto;
      grid-template-areas:
        'img name'
        'img desc';
      margin: 10px;
      gap: 3px 10px;
      padding: 5px;
      opacity: 0.7;

      width: 220px;
    }

    card:hover{
      opacity: 1;
      cursor: pointer;
    }

    card * {
      margin: 0 0;
      padding: 0 0; 
    }

    card img {
      box-sizing: border-box;
      grid-area: img;
      display: block;
      width:  64px;
      height: 64px;
      text-decoration: none;
      outline: 0px solid;
      border: 5px solid rgba(50,50,50,0.26);

      background: rgba(50,50,50,0.26);
    }

    card h4 {
      grid-area: name;
      line-height: 1.2rem;
      font-size:   1.1rem;
      padding-bottom: 2px;
      color: rgba(250,240,240,0.8);
      border-bottom: 3px solid rgba(50,50,50,0.80); 
    }

    card p {
      display: block;
      grid-area: desc;

      font-size: .7rem;
      color: rgba(250,230,230,0.6);
    }
  `;

  constructor() {
    super();
    const self = compSceneSelect;
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = self.#css;
    this.content = document.createElement('content');
    this.shadowRoot.append(
      style,
      this.content,
      document.createElement('slot')
    );
  }

  connectedCallback() {
    this.clear(this.content);
    const scenes = iGame.scenes;
    
    scenes.forEach(scene => {
      const card = document.createElement('card');
      const img  = document.createElement('img');
      const name = document.createElement('h4');
      const desc = document.createElement('p');
      card.setAttribute('scene',scene.name);
      name.textContent = scene.name;
      desc.textContent = scene.description;

      card.append(img,name,desc);
      this.boundEvents.push([card, 'click', this.#selectScene]);
      this.content.append(card);
    });
    super.connectedCallback();
  }

  #selectScene(e) {
    let target = e.target;
    if (e.target.nodeName !== 'CARD') 
      target = target.parentElement;
    const name =  target.getAttribute('scene');
    

    if (iGame.hasScene(name) && name !== iGame.states.scene) {
      console.log(`selected Scene: ${name}`);
      iGame.states.scene = name;
    }
  }
}

const tagName = 'scene-select';
if (customElements.get(tagName) === undefined) {
  customElements.define(tagName, compSceneSelect);
}
