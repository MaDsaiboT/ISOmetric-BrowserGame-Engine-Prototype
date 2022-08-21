'use strict';

import * as main from '../main.js';
import * as utils from '../_utils/utils.js';
import { Game } from '../GAME/Game.js';
import { router } from './router.js';
import { auth } from './auth.js';
//import { map } from '../map.js';

// const iMap = new map;

const ui = {};

const states = {
  theme: 'dark'
};

const statesHadlder = {
  get: Reflect.get,
  set: Reflect.set
};

ui.states = new Proxy(states, statesHadlder);

ui.states.viewPortChanged = false;

ui.states.mouseOnUi = false;
ui.states.mouseOnContent = false;
ui.states.mousePos = { x: -1, y: -1 };
ui.states.mapPos = { x: 0, y: 0, layer: 0 };
ui.states.mapPosLast = { x: 0, y: 0, layer: 0 };

// ui Elements
ui.wrapper = document.querySelector('#ui');
ui.main = document.querySelector('#ui main');
ui.mainMenu = document.querySelector('#ui main .menu');

ui.elemToolTip = document.getElementById('toolTip');
ui.elemMousePos = document.querySelector('#ui footer mousePos');

ui.jasonMapData = document.getElementById('jasonMapData');
ui.minimap = document.getElementById('canvasMapBufferContainer');

ui.content = document.getElementById('content');
ui.headerNav01 = document.getElementById('headerNav01');

function click(e) {
  if (e.target !== e.currentTarget) return;
}

/**
 * @param  e    Event
 * @return void
 */
function mousemove(e, iGame) {
  ui.states.mouseOnUi = e.target === ui.main;
  ui.states.mouseOnContent = e.target === ui.content;

  e.preventDefault();
  e.stopPropagation();
  //ui.main.removeEventListener('mousemove', e => mousemove(e));

  if (
    !iGame ||
    iGame.states.running === Game.runstate.LOADING ||
    !ui.states.mouseOnUi
  ) {
    ui.elemToolTip.classList.add('hidden');
    return true;
  }

  ui.states.mousePos.x = e.x;
  ui.states.mousePos.y = e.y;

  if (ui.viewPortChanged){
    ui.elemToolTip.classList.add('hidden');
    return;
  } 
    
  const s2m = main.screenToMap(
    ui.states.mousePos.x,
    ui.states.mousePos.y
  );

  Object.assign(ui.states.mapPos,s2m);

  if (ui.states.mapPos.x < 0 || ui.states.mapPos.y < 0) {
    ui.elemToolTip.classList.add('hidden');
    return;
  }

  ui.elemToolTip.classList.remove('hidden');
  ui.elemToolTip.style.top = e.y + 'px';
  ui.elemToolTip.style.left = e.x + 15 + 'px';

  if (
    ui.states.mapPosLast.x !== ui.states.mapPos.x ||
    ui.states.mapPosLast.y !== ui.states.mapPos.y
  ) {
    ui.states.mapPos.layer = main.iMap.getHighestLayer(ui.states.mapPos);

    if (ui.states.mapPos.layer <= -1) {
      ui.elemToolTip.classList.add('hidden');
      return;
    }

    const hasLeft  = main.iMap.tileHasNeighborLeft(ui.states.mapPos);
    const hasRight = main.iMap.tileHasNeighborRight(ui.states.mapPos);

    const layerName = main.iMap.mapDataKeys[ ui.states.mapPos.layer];


    ui.elemToolTip.innerHTML = `X:${ui.states.mapPos.x} Y:${ui.states.mapPos.y}`;
    ui.elemToolTip.innerHTML += `<br/> layer:${ui.states.mapPos.layer}:${layerName}`;
    ui.elemToolTip.innerHTML += `<br/> left:${hasLeft}`;
    ui.elemToolTip.innerHTML += `<br/> right:${hasRight}`;

    Object.assign(ui.states.mapPosLast,ui.states.mapPos);

    
  }
 
}

function mouseout() {
  //ui.elemMousePos.innerHTML = ``;
  ui.states.mousePos.x = -1;
  ui.states.mousePos.y = -1;
  ui.states.mouseOnUi = false;
  if (!ui.mouseOnContent) {
    //window.history.replaceState(null, null, '/');
  }
}

ui.init = iGame => {
  //console.log(iGame);

  ui.headerNav01.addEventListener('click', () => {
    console.log('jasonMapData toogle');
    ui.jasonMapData.classList.toggle('hidden');
  });

  ui.main.addEventListener('mousemove', e => mousemove(e, iGame));
  ui.main.addEventListener('mouseout', e => mouseout(e));
  ui.main.addEventListener('click', e => click(e));

  ui.loader = document.getElementById('loader');

  iGame.states.subscribe('ui-running', 'running', (newVal, oldVal) => {
    //console.log('ui','running',{newVal,oldVal})

    switch (newVal) {
      case Game.runstate.LOADING:
        ui.main.querySelector('modal-window')?.remove();
        ui.elemToolTip.classList.add('hidden');
        ui.wrapper.classList.add('loading');
        ui.main.style.background = 'rgba(33,33,33,1)';
        ui.loader.classList.remove('hidden');
        ui.minimap.classList.add('hidden');
        break;

      case Game.runstate.RUNNING:
        ui.wrapper.classList.remove('loading');
        ui.main.style.background = 'transparent';
        ui.loader.classList.add('hidden');
        ui.minimap.classList.remove('hidden');
        break;

      case Game.runstate.PAUSED:
        ui.main.style.background = 'rgba(0,0,0,0.3)';
        break;
    }
  });

  iGame.states.setRenderer('fps', 
    newVal => `fps:${newVal.toString().padStart(3, '0')}`
  );

  iGame.states.setRenderer('frameDelta',
    newVal => `Δ:${newVal}ms`
  );

  iGame.states.addRenderCondition('framesSinceStart',
    newVal => (newVal % 20 === 0)
  );

  iGame.states.addRenderCondition('fps', 
    _ => iGame.states.running !== Game.runstate.LOADING
  );

  iGame.states.addRenderCondition('frameDelta', 
    _ => iGame.states.running !== Game.runstate.LOADING
  );
};

ui.getModalWindow = async () => {
  ui.modalWindow = ui.main.querySelector('modal-window');
  if (!ui.modalWindow) {
    await import('./webComponents/modalWindow.js');
    ui.modalWindow = document.createElement('modal-window');
    ui.modalWindow.innerHTML = '';
    ui.main.append(ui.modalWindow);
  }
  return ui.modalWindow;
};


let lastCat = null;
router.addObserver({
  name: 'settings',
  callback: async (params, cur, last) => {
    if (params.category && params.category === lastCat) return;

    //console.log(cur,last,params);
    await ui.getModalWindow();

    let compSettings = ui.modalWindow.querySelector('component-settings');
    if (!compSettings) {
      //console.log('import settings');
      await import('./webComponents/settings/settingsMenu.js');
      compSettings = document.createElement('component-settings');
      compSettings.setAttribute('category', params.category);
      ui.modalWindow.innerHTML = '<h3 slot="header">settings</h3>';
      ui.modalWindow.append(compSettings);
    } else {
      compSettings.setAttribute('category', params.category);
    }
    lastCat = params.category;
  }
});

export { ui };
export default ui;
