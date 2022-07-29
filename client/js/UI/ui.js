import * as main  from '../main.js';
import * as utils from '../_utils/utils.js';

const ui = {};


const state = {}

let paused = false;
let viewPortChanged = false;

let mouseOnUi      = false;
let mouseOnContent = false;

const mousePos = {x:-1,y:-1} 

// ui Elements
ui.main          = document.querySelector('#ui main');
ui.mainMenu      = document.querySelector('#ui main .menu');

ui.elemToolTip   = document.getElementById('toolTip');
ui.elemMousePos  = document.querySelector('#ui footer mousePos');

ui.jasonMapData  = document.getElementById('jasonMapData');


headerNav01.addEventListener('click',e=>{
  console.log('jasonMapData toogle');
  jasonMapData.classList.toggle('hidden')
})


ui.main.addEventListener('mousemove', e => mousemove(e),);
ui.main.addEventListener('mouseout',  e => mouseout(e));
ui.main.addEventListener('click',     e => click(e));



function click(e) {
  if(e.target !== e.currentTarget) return;
}

/**
 * @param  {[type]}
 * @return void
 */
function mousemove(e) {

  e.preventDefault();
  e.stopPropagation();
  //ui.main.removeEventListener('mousemove', e => mousemove(e));
  mouseOnUi      = (e.target === ui.main);
  mouseOnContent = (e.target === content);

  if(!mouseOnUi) return true

  mousePos.x = e.x;
  mousePos.y = e.y;

  //console.log('mousemove')

  main.state.mousePos = mousePos;

  ui.elemToolTip.classList.add('hidden');

  if (paused || viewPortChanged) return;
  const mapPos = main.screenToMap(mousePos.x, mousePos.y);
  if (mapPos.x < 0 || mapPos.y < 0) return;

  let layer = main.instanceMap.getHighestLayer(mapPos.x,mapPos.y);

  if (!(layer > -1)) return;

  const hasLeft  = main.instanceMap.tileHasNeighborLeft(mapPos.x,mapPos.y,layer);
  const hasRight = main.instanceMap.tileHasNeighborRight(mapPos.x,mapPos.y,layer);

  ui.elemToolTip.classList.remove('hidden');
  ui.elemToolTip.style.top  = (e.y) + 'px';
  ui.elemToolTip.style.left = (e.x+15) + 'px';

  ui.elemToolTip.innerHTML  = `X:${mapPos.x} Y:${mapPos.y}`;
  ui.elemToolTip.innerHTML += `<br/> layer:${layer+1}`;
  ui.elemToolTip.innerHTML += `<br/> left:${hasLeft}`;
  ui.elemToolTip.innerHTML += `<br/> right:${hasRight}`;

}

function mouseout(e) {
  //ui.elemMousePos.innerHTML = ``;
  mousePos.x = -1;
  mousePos.y = -1;
  state.mousePos = mousePos;
  mouseOnUi = false;
  if (!mouseOnContent ) {
    //window.history.replaceState(null, null, '/');
  }
}

export default ui