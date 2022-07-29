
const tileWidth  = 128;
const tileHeight = 64;

import {Game}     from './GAME/game.js'
import router     from './UI/router.js';

import userInput  from './ECS/systems/userInput.js';
import map        from './map.js';
import Websocket  from './websocket.js';

import ui         from './UI/ui.js';

import {createUUID, rememberUUID, UUIDs} from './_utils/uuid.js';




let mapData = {};
let mousePos = {
  x: undefined,
  y: undefined
}



let lastMapPos = {x:-1,y:-1};
let unixTimeLast = 0;
let fps = 0;

let autoPause = false;

var viewPortOffset     = {x: 0,y: 20}
var viewPortOffsetLast = {x: -1,y: -1}
var viewPortChanged    = false;
var viewPortVelocity   = 0;
var init = true;

let paused = false;

let lastTime = 0;
const fpsTarget = 60;
const nextFrame = 1000/fpsTarget
let timer = 0;
let fpsDisplay;

const canvasMap         = document.getElementById('canvasMap');
const canvasMapBuffer   = document.getElementById('canvasMapBuffer');
const canvasInteract    = document.getElementById('canvasInteract');
const viewPortIndicator = document.getElementById('viewPortIndicator');

const content = document.getElementById('content');

const ctxMap            = canvasMap.getContext('2d');
const ctxMapBuffer      = canvasMapBuffer.getContext('2d',{ willReadFrequently: true });
const ctxInteract       = canvasInteract.getContext('2d');

let width  = canvasMap.width  = canvasInteract.width  = window.innerWidth;
let height = canvasMap.height = canvasInteract.height = window.innerHeight;

//ctxMap.setTransform(1,0,0,1, w2, 200);

const instanceMap = new map(ctxMap,ctxMapBuffer,tileHeight,tileWidth);
const iGame       = new Game();

var instanceUserInput = null;

var timeStamp;

const render = property => {
  let elem = document.querySelector(`[data-binding="${property}"]`);
  if (!elem) {
    console.log('could not find element for '+property)
    return false;
  }; 


  switch (property) {
    case 'framesSinceStart':
      elem.textContent = state.framesSinceStart;
      break;

    case 'mousePos':
      if (state.mousePos.x == -1 || state.mousePos.y == -1)
        elem.textContent = '';
      else {
        elem.textContent = `X:${state.mousePos.x} Y:${state.mousePos.y}`;
      }
      break;

    case 'fps':
      elem.textContent = `fps:${state.fps.toString().padStart(3,'0')}`;
      break

    case 'console':
      if (elem.textContent) {
        elem.textContent = elem.textContent+`\n`+state.console
      }
      else {
        elem.textContent = state.console
      }
      break

    default: 
      elem.textContent = state[property];
      break;
  }
}

const setState = state => {
  return new Proxy(state,{
    set: (target, property, value) => {

      if (!target) return false;

      if (typeof target[property] != typeof value) 
        throw new Error(
            `type mismatch for ${property}(${typeof target[property]})` 
          + `\n value ${value} (${typeof value})` 
          );

      if (typeof target[property] == 'object') {
        render(property);
      }

      if (target[property] !== value) {
        target[property] = value;
        render(property);
      };
      
      
      return true;
    },

    get: (target, property) => {
      return target[property];
    }

  });
}

const state = setState({
  fps : 0,
  mousePos : {x:0,y:0},
  framesSinceStart : 0,
  console: ''
});

function drawInteract() {
  if ( !ui.mouseOnUi ) return; 
  if ( !ui.mousePos.x || !ui.mousePos.x ) return;

  const mapPos = screenToMap(mousePos.x, mousePos.y);
  if ( mapPos.x == undefined || mapPos.y == undefined ) return;

  if (viewPortChanged) {
    ui.elemToolTip.classList.add('hidden');
    ctxInteract.clearRect(-width/2,-200,width,height);
    return;
  }

  if (JSON.stringify(mapPos) === JSON.stringify(lastMapPos)) return;

  if (lastMapPos && lastMapPos.x >= 0 && lastMapPos.y >=0) {
    const screenPos = mapToScreeen(
      lastMapPos,
      (viewPortOffsetLast | {x:0,y:0} )
    );
    //console.log('screenPos',screenPos);
    //ctxInteract.fillStyle='rgba(250,50,50,.69)';
    //ctxInteract.fillRect(screenPos.x-2,screenPos.y-2, tileWidth+4, tileHeight+4);

    //ctxInteract.clearRect(screenPos.x-2,screenPos.y-2, tileWidth+4, tileHeight+4);
  }

  if (mapPos.x < 0 || mapPos.y < 0) return;
  let layer = instanceMap.getHighestLayer(mapPos.x,mapPos.y);
  if (!(layer > -1)) return;

  ctxInteract.clearRect(-width/2,-200,width,height);
  //ctxInteract.fillStyle = 'rgba(20,50,20,0.3)';
  //ctxInteract.fillRect(-width/2,-200,width,height);
  ui.elemToolTip.classList.remove('hidden');
  drawTile(mapPos.x,mapPos.y,layer,'green',ctxInteract);
  lastMapPos = mapPos;
  //console.log('lastMapPos',lastMapPos);

  // console.log(mousePos);
  // console.log(mapPos);
}

function drawViewport(instanceUserInput,compare = true) {

  if (!instanceUserInput) return; 
  if (viewPortOffset === undefined) return; 

  var ctx = ctxMap;

  var w = ctx.canvas.width;
  var h = ctx.canvas.height;

  let bw = ctxMapBuffer.canvas.width;
  let bh = ctxMapBuffer.canvas.height;

  if (instanceUserInput.arrowKeysActive()) {
    if ( viewPortVelocity <= 3)      viewPortVelocity  = 3;
    if ( state.framesSinceStart % 15 === 0) viewPortVelocity += 1;
    if ( viewPortVelocity >= 15)     viewPortVelocity  = 13;

    if (  instanceUserInput.arrowRight 
      && !instanceUserInput.arrowLeft 
      &&  viewPortOffset.x < (bw/2 - w/2)
    ) {
      viewPortOffset.x += viewPortVelocity;
      if (viewPortOffset.x >= (bw/2 - w/2)) 
        viewPortOffset.x = (bw/2 - w/2);
    }

    if (  instanceUserInput.arrowLeft
      && !instanceUserInput.arrowRight
      &&  viewPortOffset.x > -(bw/2 - w/2)
    ) {
      viewPortOffset.x -= viewPortVelocity;
      if (viewPortOffset.x <= -(bw/2 - w/2)) 
        viewPortOffset.x = -(bw/2 - w/2);
    }

    if (  instanceUserInput.arrowDown
      && !instanceUserInput.arrowUp
      &&  viewPortOffset.y < (bh - h)
    ) {
      viewPortOffset.y += viewPortVelocity;
      if (viewPortOffset.y >= (bh - h)) 
        viewPortOffset.y = (bh - h);
    }

    if (  instanceUserInput.arrowUp 
      && !instanceUserInput.arrowDown
      &&  viewPortOffset.y > 0
    ) {
      viewPortOffset.y -= viewPortVelocity;
      if (viewPortOffset.y <= 0) 
        viewPortOffset.y = 0;
    }

    viewPortOffset.x = Math.floor(viewPortOffset.x);
    viewPortOffset.y = Math.floor(viewPortOffset.y);

  } else {
    viewPortVelocity = 0;
  }

  if (compare) {
    viewPortChanged = !(
        viewPortOffset.x == viewPortOffsetLast.x
     && viewPortOffset.y == viewPortOffsetLast.y) 

    if (!viewPortChanged) return; 
  }
  viewPortOffsetLast.x = viewPortOffset.x;
  viewPortOffsetLast.y = viewPortOffset.y;
  ctx.save()
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,width,height);

  const drawX = Math.floor(bw/2 - w/2 + viewPortOffset.x);

  ctx.drawImage(
    canvasMapBuffer,
    drawX,
    0 + viewPortOffset.y,
    w,h,
    0,0,w,h
  );


  viewPortIndicator.style.left = drawX +'px';
  viewPortIndicator.style.top  = viewPortOffset.y +'px';
  
  lastMapPos.x = -1;
  lastMapPos.y = -1;

  ctx.restore()

  /*
  console.log(
    'render viewPort',
    compare,
    (viewPortOffset.x == viewPortOffsetLast.x && viewPortOffset.y == viewPortOffsetLast.y),
    viewPortOffset,
    viewPortOffsetLast
  );
  */
}

function screenToMap(x, y) {

  if (!tileWidth) return 

  const TILE_WIDTH_HALF  = tileWidth  / 2;
  const TILE_HEIGHT_HALF = tileHeight / 2;

  x -= width /2;
  y -= 200;

  x += viewPortOffset.x;
  y += viewPortOffset.y;

  y -= TILE_HEIGHT_HALF;

  let mapX = Math.ceil((x / TILE_WIDTH_HALF + y / TILE_HEIGHT_HALF) /2);
  let mapY = Math.ceil((y / TILE_HEIGHT_HALF -(x / TILE_WIDTH_HALF)) /2);

  return {x:mapX,y:mapY};
}

function mapToScreeen(mapPos,_viewPortOffset) {
  if (_viewPortOffset === undefined) {
    _viewPortOffset = viewPortOffset;
  }

  let x = (mapPos.x - mapPos.y) * tileWidth/2 - tileWidth/2;
  let y = (mapPos.x + mapPos.y) * tileHeight/2 - tileHeight;

  //x += width /2;
  //y += 200;

  x -= (_viewPortOffset.x);
  y -= (_viewPortOffset.y);

  return {'x':x,'y':y};
}

function drawTile(x,y,layer,color,context = ctxMap) {
  context.save();

  //console.log('drawTile',x,y,color);

  context.fillStyle = 'rgba(90,250,99,0.7)';

  context.translate(
    ((x - y) * tileWidth  / 2 ) - (viewPortOffset.x),
    ((x + y) * tileHeight / 2 ) - (viewPortOffset.y)
  );

  const z = 0.5 + 0.5 * layer;

  context.beginPath();
  context.moveTo(0,-z * tileHeight);
  context.lineTo(
     tileWidth  / 2,
     tileHeight / 2 -z * tileHeight
  );
  context.lineTo(
    0,
    tileHeight -z * tileHeight
  );
  context.lineTo(
    -tileWidth  / 2,
     tileHeight / 2-z * tileHeight
  );
  context.closePath();
  //context.fillStyle = 'rgba(90,200,99,0.1)';
  //context.stroke();
  context.fillStyle = 'rgba(90,250,99,0.5)';
  context.fill();

  context.restore();
}


function resizeCanvas() {
  width  = canvasMap.width  = canvasInteract.width  = window.innerWidth;
  height = canvasMap.height = canvasInteract.height = window.innerHeight;

  const w2 =  width / 2;
  //ctxInteract.setTransform(0,0,0,0,w2,200);
  //ctxMap.setTransform(0,0,0,0,w2,200);

  viewPortIndicator.style.width  = window.innerWidth + 'px';
  viewPortIndicator.style.height = window.innerHeight + 'px';

  ctxInteract.translate(w2, 200);

  ctxMap.setTransform(1,0,0,1, w2, 200);

  drawViewport(instanceUserInput, false);
}

  //state.console = 'lol';
  //state.console = 'wuhaaa';

  viewPortIndicator.style.width  = window.innerWidth + 'px';
  viewPortIndicator.style.height = window.innerHeight + 'px';

  ctxMapBuffer.transform(1,0,0,1,ctxMapBuffer.canvas.width/2,200);

  ctxInteract.translate(width / 2, 200);



  window.addEventListener('resize',() => resizeCanvas());


  //uiMain.addEventListener();

  instanceUserInput = new userInput(); 

  ui.init(iGame,instanceUserInput);

  instanceMap.load('map001').then(
    v => {
      drawViewport(instanceUserInput,false);
      iGame.states.running =  Game.runstate.RUNNING;
    },
    err => {
      console.log(err)
    }
  );



state.framesSinceStart = 0;
let x = 0;
let direction = 1;
let offset = {x:0,y:0};
let loopActive = false;
function loop(_timeStamp) {
  timeStamp = _timeStamp;
  state.framesSinceStart ++;
  loopActive = true;
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;

  var unixTime = Math.floor(timeStamp / 1000);
  let pause_counter = '';

  if (unixTime == unixTimeLast) fps += 1
  else {
    state.fps = fps;
    fps = 0
    unixTimeLast = unixTime;
  };

  //const x = (mousePos.x|0).toString(10).padStart(5, "0");
  //const y = (mousePos.y|0).toString(10).padStart(5, "0");

  //ui.elemMousePos.textContent  = '';

  if (viewPortChanged) {
   // ui.elemMousePos.textContent  += ` Viewport `;
   // ui.elemMousePos.textContent  += ` x:${viewPortOffset.x}`;
   // ui.elemMousePos.textContent  += ` y:${viewPortOffset.y}`;
   // ui.elemMousePos.textContent  += ` velocity:${viewPortVelocity}`;
  }

  //ui.elemMousePos.textContent  += `${state.framesSinceStart.toString(2).padStart(32,'0')}`;
  if (pause_counter) {
    // ui.elemMousePos.textContent  += `| ${pause_counter}`;
  }
 
  drawViewport(instanceUserInput);
  drawInteract();

  if (iGame.states.running === Game.runstate.RUNNING) {
    if (state.framesSinceStart % 2 === 0) {
      if ( direction ) { x+=3 } else { x-=3} 
      if ( x > 3*tileHeight/2) direction = 0
      if ( x < 0 ) direction = 1
    }
   
  }

  ctxInteract.clearRect(-width/2,-200,width,height);

  offset.x = viewPortOffset.x + x*2
  offset.y = viewPortOffset.y - x

  instanceMap.drawCaracter(1,1,0,ctxInteract,offset);
  

  if (timer > nextFrame) {
    timer = 0;
  }
  else {
    timer += deltaTime;
  }

  if(!paused) {
    ui.main.classList.remove('paused');
    ui.mainMenu.classList.add('hidden');
    if (autoPause === true) {
      if (exitedPage) pause_counter = ` | game will pause in ${10-(unixTime - exitedPage)}s`;
      if (exitedPage && unixTime - exitedPage > 9) {
        console.log('pause game due to loss of focus');
        paused = true
        exitedPage = null;
      }
    }

  }
  if(paused) {
    ui.main.classList.add('paused');
    ui.mainMenu.classList.remove('hidden');
    return
  }

  if (iGame.states.running != Game.runstate.LOADING) {
    window.requestAnimationFrame(loop);
  } else {
    //state.fps = 0;
    //state.framesSinceStart = 0;
  }
}

async function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}


iGame.states.subscribe('main-running','running',(newVal,oldVal) => {
  console.log('main','running',{newVal,oldVal})

  switch (newVal){
    case Game.runstate.LOADING:
      console.log('────── loading ──────')
      break;

    case Game.runstate.RUNNING:
      console.log('────── running ──────')
      if (!loopActive) loop(0)
      break;
  }
  
});


const runthis = e => {

}

window.setTimeout(runthis,2000);

window.addEventListener('beforeunload', function (e) {
   // e.preventDefault();
   // e.returnValue = '';
});
export {state, drawViewport,screenToMap, iGame, instanceMap, instanceUserInput}