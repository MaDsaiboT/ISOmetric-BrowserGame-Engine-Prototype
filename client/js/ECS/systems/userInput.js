import * as main  from '../../main.js';
import * as ui    from '../../UI/ui.js';

class userInput {

  static instance = null;

  constructor() {
    //Keyboard State Data

    if (userInput.instance instanceof userInput) {
      return userInput.instance;
    } 

    this.keyState     = []; //Keep track of the key state
    this.keyCount     = 0;

    this.arrowUp      = false;
    this.arrowDown    = false;
    this.arrowLeft    = false;
    this.arrowRight   = false;

    this.exitedPage = null;

    this.viewPortVelocity     = 0;
    this.viewPortOffset       = {x:0, y:0};
    this.viewPortOffsetLast   = {x:0, y:0};
    this.viewPortChanged      = false;

    this.bindEvents();

  
    userInput.instance = this;
  }

  bindEvents(){
    window.addEventListener( 'keydown', e => this.onKeyDown(e) );
    window.addEventListener( 'keyup',   e => this.onKeyUp(e)   );
    //window.addEventListener( 'mouseout', e => this.OnMouseOut(e) );
  }

  OnKeyUp(event) {
    if (this.viewPortChanged) {
      console.log('OnKeyUp',event);
      main.drawViewport(this);
      this.viewPortChanged = false;
      this.viewPortVelocity = 1;
    }
  }

  OnMouseOut(event) {
    const e = event;
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    if ((mouseY >= 0 && mouseY <= window.innerHeight) &&
        (mouseX >= 0 && mouseX <= window.innerWidth)
    ) {
      this.exitedPage = null;
      return;
    }
    this.exitedPage = Math.floor(Date.now() / 1000);
  }

   //================================================
  //Keybooard
  key(kCode) { return (this.keyState[kCode] === true); }

  
  arrowKeysActive() {
    return [this.arrowUp,this.arrowDown,this.arrowLeft,this.arrowRight].some(x => !!x);
  }

  onKeyDown(e) { //console.log( e.keyCode );
    this.keyState[ e.keyCode ] = true;
    this.keyCount++;

    switch(e.keyCode) { //space:32
      case 37: this.arrowLeft   = true; break;
      case 38: this.arrowUp     = true; break;
      case 39: this.arrowRight  = true; break;
      case 40: this.arrowDown   = true; break;
    }
  }

  onKeyUp(e) {
    this.keyState[ e.keyCode ] = false;
    this.keyCount--;
    switch(e.keyCode){
      case 37: this.arrowLeft   = false; break;
      case 38: this.arrowUp     = false; break;
      case 39: this.arrowRight  = false; break;
      case 40: this.arrowDown   = false; break;
    }
  }

  isShift() { return this.keyState[ 16 ]; }
  isCtrl()  { return this.keyState[ 17 ]; }

}

export default userInput
