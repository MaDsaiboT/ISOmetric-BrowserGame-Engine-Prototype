"use strict";

const tileWidth  = 128;
const tileHeight = 64;

import {Game}     from './GAME/Game.js';

import router     from './UI/router.js';

import userInput  from './ECS/systems/userInput.js';

import {ecs}      from './ECS/ecs.js';

import map        from './map.js';
import Websocket  from './websocket.js';

import ui         from './UI/ui.js';

import math       from './_utils/math.js'; // import our niftly litlle math libary 
import * as utils from './_utils/utils.js'; // import our niftly litlle utils libary 

import {createUUID, rememberUUID, UUIDs} from './_utils/uuid.js';

//import ProgressBar            from './UI/webComponents/progressbar.js';
import DisplayDirectionalKeys from './UI/webComponents/displayDirectionalKeys.js';


let lastMapPos = {x:-1,y:-1};
let unixTimeLast = 0;
let fps = 0;

let autoPause = false;

var viewPortOffset     = {x: 0,y: 20};
var viewPortOffsetLast = {x: -1,y: -1};
var viewPortChanged    = false;
var viewPortVelocity   = 0;
var init = true;

let lastTime = 0;
const fpsTarget = 60;
const nextFrame = 1000/fpsTarget;
let timer = 0;
let fpsDisplay;

const canvasMap         = document.getElementById('canvasMap');
const canvasMapBuffer   = document.getElementById('canvasMapBuffer');
const canvasInteract    = document.getElementById('canvasInteract');
const viewPortIndicator = document.getElementById('viewPortIndicator');

const ctxMap            = canvasMap.getContext('2d');
const ctxMapBuffer      = canvasMapBuffer.getContext('2d',{ willReadFrequently: true });
const ctxInteract       = canvasInteract.getContext('2d');

let width  = canvasMap.width  = canvasInteract.width  = window.innerWidth;
let height = canvasMap.height = canvasInteract.height = window.innerHeight;

//ctxMap.setTransform(1,0,0,1, w2, 200);

const iMap  = new map(ctxMap,ctxMapBuffer,tileHeight,tileWidth);
const iGame = new Game();

var iUserInput = null;

var timeStamp;

function drawInteract() {

  if ( !ui.states.mouseOnUi ) return; 
  if ( !ui.states.mousePos.x || !ui.states.mousePos.x ) return;

  if ( ui.states.mapPos.x === undefined || ui.states.mapPos.y === undefined ) return;

  if ( ui.viewPortChanged || iGame.states.runstate === Game.runstate.RUNNING ) {
    ui.elemToolTip.classList.add('hidden');
  }

  if (ui.states.lastMapPos && ui.states.lastMapPos.x >= 0 && ui.states.lastMapPos.y >=0) {
    ui.states.screenPos = mapToScreeen(
      ui.states.lastMapPos,
      (ui.states.viewPortOffsetLast | {x:0,y:0} )
    );
  }

  if (ui.states.mapPos.x < 0 || ui.states.mapPos.y < 0) return;
  let layer = iMap.getHighestLayer(ui.states.mapPos.x,ui.states.mapPos.y);

   if (layer < 0 ||  ui.viewPortChanged ) {
    ui.elemToolTip.classList.add('hidden');
    return;
  }

  drawTile(ui.states.mapPos.x,ui.states.mapPos.y,layer,undefined,ctxInteract);
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

    viewPortOffset.x = math.clamp(viewPortOffset.x,-(bw*0.5 - w*0.5),(bw*0.5 - w*0.5));
    viewPortOffset.y = math.clamp(viewPortOffset.y,0,(bh - h));

    viewPortOffset.x = Math.floor(viewPortOffset.x);
    viewPortOffset.y = Math.floor(viewPortOffset.y);

  } else {
    viewPortVelocity = 0;
  }

  if (compare) {
    viewPortChanged = !(
      viewPortOffset.x == viewPortOffsetLast.x &&
      viewPortOffset.y == viewPortOffsetLast.y
    )
 
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

  let x = (mapPos.x - mapPos.y) * tileWidth/2;
  let y = (mapPos.x + mapPos.y) * tileHeight/2;

  x += width /2;
  y += 200;

  x -= (_viewPortOffset.x);
  y -= (_viewPortOffset.y);


  x = Math.round(x);
  y = Math.round(y);

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
  async _ => {
    await ecs.systemAdd('walkPaths',{priority:200,active:true});
    await ecs.systemAdd('movement', {priority:400,active:true});
    await ecs.systemAdd('facing',   {priority:410,active:true});
    await ecs.systemAdd('drawCubes',{priority:500,active:true,runOnPause:true});

    await ecs.sortSystems();

    drawViewport(iUserInput,false);

    iGame.states.running = Game.runstate.RUNNING;
  },
  err => {
    console.log(err)
  }
);


let facingLast = new Map();

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

  if (ui.viewPortChanged || iUserInput.arrowKeysActive()) {
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
  

  // const names = ['cube-001','cube-002'];
  // names.forEach(name=>{
  //   if (!facingLast.has(name)) facingLast.set(name, null);
  //   const ent = ecs.entityGetByName(name);

  //   if (ent && ent.has('facing') && ent.facing.alias != facingLast.get(name)) {
  //     console.log(`${name} facing: ${ent.facing.alias}`); 
  //     facingLast.set(name,ent.facing.alias);
  //   }
  // })
  

  if (timer > nextFrame) {
    timer = 0;
  }
  else {
    timer += deltaTime;
  }

  if (autoPause === true) {
    if (exitedPage) pause_counter = ` | game will pause in ${10-(unixTime - exitedPage)}s`;
    if (exitedPage && unixTime - exitedPage > 9) {
      console.log('pause game due to loss of focus');
      paused = true
      exitedPage = null;
    }
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

    case Game.runstate.PAUSED:
      console.log('────── paused  ──────')
      const ent = ecs.entityGetByName('cube-001');
      console.log(ent.serialize());
      break;
  }
  
});


const runthis = async e => {

  const path1 = ecs.components.get('path');

  console.log(path1);

  path1.step = 0
  path1.steps.push({x:1,y:1,layer:0});
  path1.steps.push({x:1,y:2,layer:0});
  path1.steps.push({x:1,y:3,layer:0});
  path1.steps.push({x:0,y:3,layer:0});
  path1.steps.push({x:1,y:3,layer:0});
  path1.steps.push({x:1,y:4,layer:0});
  path1.steps.push({x:1,y:3,layer:0});
  path1.steps.push({x:1,y:2,layer:0});

  const ent1 = ecs.entityCreate(`cube-001`,true,['position','facing']);

  ent1.componentAdd('path', path1);

  ent1.position.x = 1;
  ent1.position.y = 1;

  ent1.componentAdd('targetPos', ecs.components.get('targetPos'));

  ent1.targetPos.x = 1;
  ent1.targetPos.y = 1;

  ent1.tags.add('moving');


  const path2 = ecs.components.get('path');
  path2.step = 0

  path2.steps.push({x:2,y:4,layer:0});
  path2.steps.push({x:2,y:3,layer:0});
  path2.steps.push({x:2,y:2,layer:0});
  path2.steps.push({x:2,y:1,layer:0});
  path2.steps.push({x:3,y:1,layer:0});
  path2.steps.push({x:3,y:2,layer:0});
  path2.steps.push({x:3,y:3,layer:0});
  path2.steps.push({x:4,y:3,layer:0});
  path2.steps.push({x:5,y:3,layer:0});
  path2.steps.push({x:5,y:4,layer:0});
  path2.steps.push({x:4,y:4,layer:0});
  path2.steps.push({x:3,y:4,layer:0});

  const ent2 = ecs.entityCreate(`cube-002`,true,['position','facing']);

  ent2.position.x = 2;
  ent2.position.y = 4;

  ent2.componentAdd('path', path2);
  ent2.componentAdd('targetPos', ecs.components.get('targetPos'));

  ent2.targetPos.x = 2;
  ent2.targetPos.y = 4;

  ent2.tags.add('moving');


  const path3 = ecs.components.get('path');
  path3.step = 0

  path3.steps.push({x:8,y: 8,layer:0});
  path3.steps.push({x:8,y: 9,layer:0});
  path3.steps.push({x:7,y: 9,layer:0});
  path3.steps.push({x:6,y: 9,layer:0});
  path3.steps.push({x:5,y: 9,layer:0});
  path3.steps.push({x:5,y: 8,layer:0});
  path3.steps.push({x:4,y: 8,layer:0});
  path3.steps.push({x:3,y: 8,layer:0});
  path3.steps.push({x:3,y: 9,layer:0});
  path3.steps.push({x:3,y:10,layer:0});
  path3.steps.push({x:3,y:11,layer:0});
  path3.steps.push({x:4,y:11,layer:0});
  path3.steps.push({x:5,y:11,layer:0});
  path3.steps.push({x:5,y:10,layer:0});
  path3.steps.push({x:6,y:10,layer:0});
  path3.steps.push({x:7,y:10,layer:0});
  path3.steps.push({x:7,y: 9,layer:0});
  path3.steps.push({x:8,y: 9,layer:0});

  const ent3 = ecs.entityCreate(`cube-003`,true,['position','facing']);

  ent3.position.x = 8;
  ent3.position.y = 8;

  ent3.componentAdd('path', path3);
  ent3.componentAdd('targetPos', ecs.components.get('targetPos'));

  ent3.targetPos.x = 8;
  ent3.targetPos.y = 8;

  ent3.tags.add('moving');
}

window.setTimeout(runthis,5000);

window.addEventListener('beforeunload', e => {
   // e.preventDefault();
   // e.returnValue = '';
});

export {drawViewport, screenToMap, 
  iGame, iMap, iUserInput, 
  width, height, ctxInteract,
  viewPortOffset
}