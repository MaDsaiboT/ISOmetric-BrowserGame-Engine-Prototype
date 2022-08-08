
const tileWidth  = 128;
const tileHeight = 64;

import {Game}     from './GAME/game.js'
import router     from './UI/router.js';

import userInput  from './ECS/systems/userInput.js';

import {ecs} from './ECS/ecs.js';

import map        from './map.js';
import Websocket  from './websocket.js';

import ui         from './UI/ui.js';

import math from './_utils/math.js' // import our niftly litlle math libary 
import * as utils from './_utils/utils.js' // import our niftly litlle math libary 



import {createUUID, rememberUUID, UUIDs} from './_utils/uuid.js';


//import ProgressBar            from './UI/webComponents/progressbar.js';
import DisplayDirectionalKeys from './UI/webComponents/displayDirectionalKeys.js';

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

const iMap = new map(ctxMap,ctxMapBuffer,tileHeight,tileWidth);
const iGame       = new Game();

var iUserInput = null;

var timeStamp;


const render = property => {
  let elem = document.querySelector(`[data-binding="${property}"]`);
  if (!elem) {
    console.log('could not find element for '+property)
    return false;
  }; 

  switch (property) {

    case 'mousePos':
      if (state.mousePos.x == -1 || state.mousePos.y == -1)
        elem.textContent = '';
      else {
        elem.textContent = `X:${state.mousePos.x} Y:${state.mousePos.y}`;
      }
      break;


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
  mousePos : {x:0,y:0},
  console: ''
});

function drawInteract() {
  //console.log(ui.mouseOnUi);
  if ( !ui.states.mouseOnUi ) return; 
  if ( !ui.states.mousePos.x || !ui.states.mousePos.x ) return;

  if ( ui.states.mapPos?.x == undefined || ui.states.mapPos?.y == undefined ) return;

  if (ui.viewPortChanged) {
    ui.elemToolTip.classList.add('hidden');
    //ctxInteract.clearRect(-width/2,-200,width,height);
    //return;
  }

  //if (JSON.stringify(mapPos) === JSON.stringify(lastMapPos)) return;

  if (ui.states.lastMapPos && ui.states.lastMapPos.x >= 0 && ui.states.lastMapPos.y >=0) {
    ui.states.screenPos = mapToScreeen(
      ui.states.lastMapPos,
      (ui.states.viewPortOffsetLast | {x:0,y:0} )
    );
    //console.log('screenPos',screenPos);
    //ctxInteract.fillStyle='rgba(250,50,50,.69)';
    //ctxInteract.fillRect(screenPos.x-2,screenPos.y-2, tileWidth+4, tileHeight+4);

    //ctxInteract.clearRect(screenPos.x-2,screenPos.y-2, tileWidth+4, tileHeight+4);
  }

  if (ui.states.mapPos.x < 0 || ui.states.mapPos.y < 0) return;
  let layer = iMap.getHighestLayer(ui.states.mapPos.x,ui.states.mapPos.y);
  if (!(layer > -1)) return;

  ctxInteract.clearRect(-width/2,-200,width,height);
  //ctxInteract.fillStyle = 'rgba(20,50,20,0.3)';
  //ctxInteract.fillRect(-width/2,-200,width,height);
  ui.elemToolTip.classList.remove('hidden');
  //console.log(ui.mapPos.x,ui.mapPos.y,layer);
  drawTile(ui.states.mapPos.x,ui.states.mapPos.y,layer,undefined,ctxInteract);
  //ui.lastMapPos = Object.assign({},ui.mapPos);
  //console.log('lastMapPos',lastMapPos);

  // console.log(mousePos);
  // console.log(mapPos);
}

function drawViewport(iUserInput,compare = true) {

  if (!iUserInput) return; 
  if (viewPortOffset === undefined) return; 

  var ctx = ctxMap;

  var w = ctx.canvas.width;
  var h = ctx.canvas.height;

  let bw = ctxMapBuffer.canvas.width;
  let bh = ctxMapBuffer.canvas.height;

  if (iUserInput.arrowKeysActive()) {
    if ( iGame.states.framesSinceStart % 15 === 0) viewPortVelocity += 1;
    viewPortVelocity = math.clamp(viewPortVelocity,3,13);

    if (iUserInput.arrowRight && !iUserInput.arrowLeft ) {
      viewPortOffset.x += viewPortVelocity;
    }

    if (iUserInput.arrowLeft && !iUserInput.arrowRight) {
      viewPortOffset.x -= viewPortVelocity;
    }

    if (iUserInput.arrowDown && !iUserInput.arrowUp) {
      viewPortOffset.y += viewPortVelocity;
    }

    if (iUserInput.arrowUp && !iUserInput.arrowDown) {
      viewPortOffset.y -= viewPortVelocity;
    }

    viewPortOffset.x = math.clamp(viewPortOffset.x,-(bw*0.5 - w*.5),(bw*0.5 - w*0.5));
    viewPortOffset.y = math.clamp(viewPortOffset.y,0,(bh - h));

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

  color = color || 'rgba(90,250,99,0.5)'

  context.fillStyle = color;

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

  drawViewport(iUserInput, false);
}

viewPortIndicator.style.width  = window.innerWidth + 'px';
viewPortIndicator.style.height = window.innerHeight + 'px';

ctxMapBuffer.transform(1,0,0,1,ctxMapBuffer.canvas.width/2,200);
ctxInteract.translate(width / 2, 200);

window.addEventListener('resize',() => resizeCanvas());


//uiMain.addEventListener();

iUserInput = new userInput(); 

ui.init(iGame,iUserInput);

iMap.load('map001').then(
   async v => {
    await ecs.systemAdd('walkPaths',200, true);
    await ecs.systemAdd('movement', 400, true);
    await ecs.systemAdd('drawCubes',500, true);

    await ecs.sortSystems();

    drawCubes = ecs.systemGet('drawCubes')
    movement  = ecs.systemGet('movement')
   

    drawViewport(iUserInput,false);

    iGame.states.running =  Game.runstate.RUNNING;
  },
  err => {
    console.log(err)
  }
);


const path = [];
path.push({x:2,y:4});
path.push({x:2,y:3});
path.push({x:2,y:2});
path.push({x:2,y:1});
path.push({x:3,y:1});
path.push({x:3,y:2});
path.push({x:3,y:3});
path.push({x:4,y:3});
path.push({x:5,y:3});
path.push({x:5,y:4});
path.push({x:4,y:4});
path.push({x:3,y:4});

function* gen(path) {
  let i = -1;
  while (true) {
    i++
    if (i >= path.length) i=0;
    yield path[i];
  }
}

const pathIterator = gen(path);

const cube = {}
cube.hue = 60;
cube.position = {x:2,y:4,layer:0};
cube.path = path;
cube.targetPos = pathIterator.next().value;
cube.facing = {x: 1, y:1};

const easeTo = (position,target, ease=0.05) => {
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  position.x += dx * ease;
  position.y += dy * ease;
  if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
    position.x = target.x;
    position.y = target.y;
  }
  return position;
}

const getFacingAlias = (facing) => {
  if(facing.x ==  1 && facing.y ==  0) return 'north'
  if(facing.x ==  1 && facing.y ==  1) return 'northeast'
  if(facing.x ==  1 && facing.y == -1) return 'northwest'

  if(facing.x ==  0 && facing.y ==  1) return 'east' 
  if(facing.x ==  0 && facing.y == -1) return 'west'

  if(facing.x == -1 && facing.y ==  0) return 'south' 
  if(facing.x == -1 && facing.y ==  1) return 'southeast'
  if(facing.x == -1 && facing.y == -1) return 'northwest'

  return null;
}

let movement  = null;
let drawCubes = null;


iGame.states.framesSinceStart = 0;
let x = 0;
let direction = 1;
let offset = {x:0,y:0};
let loopActive = false;

let t = 0;
let facing = {x:0,y:0}
function loop(_timeStamp) {
  timeStamp = _timeStamp;
  iGame.states.framesSinceStart ++;
  loopActive = true;
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;

  var unixTime = Math.floor(timeStamp / 1000);
  let pause_counter = '';

  if (unixTime == unixTimeLast) fps += 1
  else {
    iGame.states.fps = fps;
    iGame.states.frameDelta = +deltaTime.toFixed(2).substring(0,5);
    fps = 0
    unixTimeLast = unixTime;
  };

  //const x = (mousePos.x|0).toString(10).padStart(5, "0");
  //const y = (mousePos.y|0).toString(10).padStart(5, "0");

  ui.elemMousePos.textContent  = '';

  if (viewPortChanged || iUserInput.arrowKeysActive()) {
    ui.elemMousePos.textContent  += ` Viewport `;
    ui.elemMousePos.textContent  += ` x:${viewPortOffset.x}`;
    ui.elemMousePos.textContent  += ` y:${viewPortOffset.y}`;
    ui.elemMousePos.textContent  += ` velocity:${viewPortVelocity}`;
  }

  //ui.elemMousePos.textContent  += `${state.framesSinceStart.toString(2).padStart(32,'0')}`;
  if (pause_counter) {
    // ui.elemMousePos.textContent  += `| ${pause_counter}`;
  }
 
  drawViewport(iUserInput);
  ctxInteract.clearRect(-width/2,-200,width,height);
  drawInteract();

  ecs.runSystems(timeStamp);
  
  const targetPos = cube.targetPos;

  if (iGame.states.running === Game.runstate.RUNNING) {
     
    if (  cube.position.x == cube.targetPos.x 
      &&  cube.position.y == cube.targetPos.y
    ) {

      cube.targetPos = pathIterator.next().value;
     

      // if (cube.target < cube.path.length -1) {
      //   cube.target ++;
      //   //console.log(cube.target,cube.path[cube.target])
      // } else {
      //   cube.target = 0;
      // }
      
    } 
    else {
      facing.x = math.clamp(Math.round(cube.position.x-cube.targetPos.x),-1,1)
      facing.y = math.clamp(Math.round(cube.position.y-cube.targetPos.y),-1,1)
      facing.alias = getFacingAlias(facing);

      if (  
        getFacingAlias(facing) != null &&
        getFacingAlias(cube.facing) != getFacingAlias(facing)
      ) {
        cube.facing.x = facing.x;
        cube.facing.y = facing.y;
        cube.facing.alias = getFacingAlias(cube.facing);
        //console.log(cube.facing.alias)
      }

      cube.position = easeTo(cube.position, cube.targetPos)
    }
  }

  //console.log(cube.position)

  drawTile(targetPos.x,targetPos.y,0,'rgba(90,20,20,0.2)',ctxInteract);

  iMap.drawCaracter(
    cube.position,
    cube.hue,
    ctxInteract,
    viewPortOffset
  );
  

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

 

  const displayDirectionalKeys = document.querySelector('display-directional-keys');
  displayDirectionalKeys.active = {
       up:iUserInput.arrowUp,
     down:iUserInput.arrowDown,
     left:iUserInput.arrowLeft,
    right:iUserInput.arrowRight
  };

  if (iGame.states.running != Game.runstate.LOADING) {
    window.requestAnimationFrame(loop);
  } else {
    loopActive = false;
    iGame.states.framesSinceStart = 0;
    iGame.states.fps = 0;
  }
}


//@log('hash')
const hash = async string => {
  const utf8        = new TextEncoder().encode(string);
  const hashBuffer  = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray   = Array.from(new Uint8Array(hashBuffer));
  const hashHex     = hashArray
    .map(bytes => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

//const loggedHash = log(hash);

//const h = loggedHash();

iGame.states.subscribe('main-running','running', (newVal, oldVal) => {
  //console.log('main','running',{newVal,oldVal})

  switch (newVal) {
    case Game.runstate.LOADING:
      console.log('────── loading ──────')
      iGame.states.framesSinceStart = 0;
      iGame.states.frameDelta       = 0;
      iGame.states.fps              = 0;
      console.clear()
      break;

    case Game.runstate.RUNNING:
      console.log('────── running ──────')
      if (!loopActive) loop(0)
      break;
  }
  
});


const runthis = async e => {


  const ent1 = ecs.entityCreate(`cube-002`,true,['position']);

  ent1.position.x = 1;
  ent1.position.y = 1;
  ent1.componentAdd('targetPos', ecs.components.get('targetPos'));
  ent1.targetPos.x = 1;
  ent1.targetPos.y = 3;

  ent1.tags.add('moving');

 
  const ent2 = ecs.entityCreate(`cube-002`,true,['position']);
  ent2.position.x = 5;
  ent2.position.y = 6;
  ent2.componentAdd('targetPos', ecs.components.get('targetPos'));
  ent2.targetPos.x = 3;
  ent2.targetPos.y = 6;

  ent2.tags.add('moving');

}

window.setTimeout(runthis,5000);

window.addEventListener('beforeunload', function (e) {
   // e.preventDefault();
   // e.returnValue = '';
});
export {state, drawViewport, screenToMap, 
  iGame, iMap, iUserInput, 
  width, height, ctxInteract,
  viewPortOffset
}