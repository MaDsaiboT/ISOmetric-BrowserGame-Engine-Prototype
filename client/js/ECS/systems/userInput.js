import * as main  from '../../main.js';

import { ui }   from '../../UI/ui.js';
import { Game } from '../../GAME/Game.js';

const iGame = new Game();

class userInput {

  static instance = null;

  constructor() {
    //Keyboard State Data

    if (userInput.instance !== null) {
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


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //Mouse State Data
    this.wheelUpdateOn  = 0;
    this.wheelValue   = 0;

    this.isMouseActive  = false;
    this.leftMouse    = false;
    this.middleMouse  = false;
    this.rightMouse   = false;
    this.coord      = {
      x:0,  //current position
      y:0,
      ix:0, //initial down position
      iy:0,
      px:0, //previous move position
      py:0,
      idx:0,  //Delta since inital
      idy:0,
      pdx:0,  //Delta since previous
      pdy:0
    };

    this.bound = new Map(); 

    this.bound.set('mousedown', this.onMouseDown.bind(this) );
    this.bound.set('mouseup',   this.onMouseUp.bind(this)   );


    window.addEventListener( 'keydown', e => this.onKeyDown(e) );
    window.addEventListener( 'keyup',   e => this.onKeyUp(e)   );

    iGame.states.subscribe('input-running','running',(newVal,oldVal) => {
      console.log(`input-running ${oldVal} >> ${newVal}`);

      switch (newVal) {
        
        case Game.runstate.RUNNING:
          this.bindEvents();
          break;

        case Game.runstate.LOADING:

          this.unBindEvents();
          break;
      }
    });
  
    userInput.instance = this;
  }

  bindEvents(){
    console.log('bind events');
    //window.addEventListener( 'mouseout', e => this.OnMouseOut(e) );
    //ui.main.addEventListener( 'mousemove', e => this.OnMouseMove(e) );
    //
    //
    //console.log('input bind events',ui.main);

    ui.main.addEventListener("contextmenu", this.onContextMenu );
    ui.main.addEventListener("mousedown",   this.bound.get('mousedown'));
    ui.main.addEventListener("mouseup",     this.bound.get('mouseup'));
   // ui.main.addEventListener("mouseout",    this.onMouseUp.bind(this) );
   // ui.main.addEventListener("mousewheel",  this.onMouseWheel.bind(this) );

  }

  unBindEvents(){
    console.log('un-bind events');
    //ui.main.removeEventListener("contextmenu", this.onContextMenu );
    ui.main.removeEventListener("mousedown",   this.bound.get('mousedown') );
    ui.main.removeEventListener("mouseup",     this.bound.get('mouseup'));
  }


  updateCoords(e){
    //Current Position
    this.coord.x = e.pageX;
    this.coord.y = e.pageY;

    //Change since last
    this.coord.pdx = this.coord.x - this.coord.px;
    this.coord.pdy = this.coord.y - this.coord.py;

    //Change Since Initial
    this.coord.idx = this.coord.x - this.coord.ix;
    this.coord.idy = this.coord.y - this.coord.iy; 
  }

  onContextMenu(e){ 
    //console.log('onContextMenu');
    e.preventDefault(); 
    e.stopPropagation(); 
    return false; 
  }

  onMouseDown(e){
    e.preventDefault(); 
    e.stopPropagation();

    this.coord.ix  = this.coord.px  = this.coord.x   = e.x;
    this.coord.iy  = this.coord.py  = this.coord.y   = e.y;
    this.coord.pdx = this.coord.idx = this.coord.pdy = this.coord.idy = 0;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    switch(e.which){
      case 1: this.leftMouse    = true; break;
      case 2: this.middleMouse  = true; break;
      case 3: this.rightMouse   = true; break;
    }

    //console.log(this.coord);

    this.isMouseActive = (this.leftMouse || this.middleMouse || this.rightMouse);
  }

  onMouseUp(e){
    e.preventDefault(); 
    e.stopPropagation();
    this.updateCoords(e);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    switch(e.which){
      case 1: this.leftMouse    = false; break;
      case 2: this.middleMouse  = false; break;
      case 3: this.rightMouse   = false; break;
    }

    this.isMouseActive = (this.leftMouse || this.middleMouse || this.rightMouse);

  }


  OnKeyUp(event) {
    if (this.viewPortChanged) {
      console.log('OnKeyUp',event);
      //main.drawViewport(this);
      this.viewPortChanged = false;
      this.viewPortVelocity = 1;
    }
  }

  OnMouseMove(event) {
    event.preventDefault();
    //event.stopPropagation();
    this.mousePos.x = event.pageX;
    this.mousePos.y = event.pageY;
    console.log(this.mousePos);
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

const iUserInput = new userInput();

export default userInput;
