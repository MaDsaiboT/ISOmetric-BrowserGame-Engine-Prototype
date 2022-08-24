import math from '../../_utils/math.js'; // import our niftly litlle math libary 

export default class DisplayDirectionalKeys extends HTMLElement {

  static css = `
    :host{
      position: absolute;
      bottom: 45px;
      right: 10px;
      transform-origin right bottom;
      display: block;
      user-select: none;
    }

    .wrapper{
      display: grid;
      grid-template-columns: 40px 40px 40px;
      grid-template-rows: 35px 35px;
      gap: 5px;
      grid-column-gap: 5px;
      opacity: 0.9;
      transition: opacity 0.5s ease;
    }

    .wrapper.hidden{
      opacity: 0.0;
    }

    .key{
      height: 35px;
      width:  40px;
      border-radius:5px;
      background: #222;
      font-weight: bolder;
      color: #bbb;
      line-height: 35px;
      text-align: center;
      margin-top: 0px;
      box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5); 
      transition: margin-top 0.4s ease;
      transition: box-shadow 0.4s ease;
      font-size: 22px;
      font-family: monospace
    }

    .key.pressed{
      margin-top:4px;
      box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.5); 
      background: #444844;
    }

    .up{
      grid-row-start:    1;
      grid-row-end:      1;
      grid-column-start: 2;
      grid-column-end:   2;
    }

    .left{
      grid-row-start:    2;
      grid-row-end:      2;
      grid-column-start: 1;
      grid-column-end:   1;
    }

    .down{
      grid-row-start:    2;
      grid-row-end:      2;
      grid-column-start: 2;
      grid-column-end:   2;
    }

    .right{
      grid-row-start:    2;
      grid-row-end:      2;
      grid-column-start: 3;
      grid-column-end:   3;
    }
  `;

  constructor() {
    super();
    const self = DisplayDirectionalKeys;
    this.attachShadow({mode:'open'});

    const style = document.createElement('style');

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('wrapper');

    this.up     = document.createElement('div');
    this.down   = document.createElement('div');
    this.left   = document.createElement('div');
    this.right  = document.createElement('div');

    [this.up, this.down, this.left, this.right].forEach(
      elm=>{
        elm.classList.add('key');
        this.wrapper.appendChild(elm);
      }
    );

    this.up.classList.add('up');
    this.up.textContent = '↑';

    this.down.classList.add('down');
    this.down.textContent = '↓';

    this.left.classList.add('left');
    this.left.textContent = '←';

    this.right.classList.add('right');
    this.right.textContent = '→';

    style.innerHTML = self.css;
    //fill.classList.add('fill');

    this.shadowRoot.append(style,this.wrapper);

    //this.root = document.querySelector(':host')
    this.wrapper.classList.add('hidden');

    this.keyUp    = false;
    this.keyDown  = false;
    this.keyLeft  = false;
    this.keyRight = false;
  }

  set active({up=false,down=false,left=false,right=false}={}) {
    this.keyUp    = up;
    this.keyDown  = down;
    this.keyLeft  = left;
    this.keyRight = right;

    const keys = [this.keyUp,this.keyDown,this.keyRight,this.keyLeft];

    if (keys.some(k=>k)) {
      this.wrapper.classList.remove('hidden');
    } else {
      this.wrapper.classList.add('hidden');
    }

    if (this.keyUp)    this.up.classList.add('pressed');
    else               this.up.classList.remove('pressed');

    if (this.keyDown)  this.down.classList.add('pressed'); 
    else               this.down.classList.remove('pressed');

    if (this.keyLeft)  this.left.classList.add('pressed');
    else               this.left.classList.remove('pressed');

    if (this.keyRight) this.right.classList.add('pressed'); 
    else               this.right.classList.remove('pressed');
  } 
}

customElements.define('display-directional-keys',DisplayDirectionalKeys);