import * as main  from '../main.js';
import * as utils from '../_utils/utils.js';
import {Game}     from '../GAME/game.js'


const ui = {};


const states = {
  theme: 'dark'
}


const statesHadlder = {
  get: Reflect.get,
  set: Reflect.set
} 

ui.states = new Proxy(states,statesHadlder);

ui.states.viewPortChanged = false;

ui.states.mouseOnUi      = false;
ui.states.mouseOnContent = false;
ui.states.mousePos       = {x:-1,y:-1};
ui.states.mapPos        = {x:0,y:0,layer:0}

// ui Elements
ui.wrapper       = document.querySelector('#ui');
ui.main          = document.querySelector('#ui main');
ui.mainMenu      = document.querySelector('#ui main .menu');

ui.elemToolTip   = document.getElementById('toolTip');
ui.elemMousePos  = document.querySelector('#ui footer mousePos');

ui.jasonMapData  = document.getElementById('jasonMapData');


function click(e) {
  if(e.target !== e.currentTarget) return;
}

/**
 * @param  e    Event
 * @return void
 */
function mousemove(e,iGame) {

  ui.states.mouseOnUi      = (e.target === ui.main);
  ui.states.mouseOnContent = (e.target === content);

  e.preventDefault();
  e.stopPropagation();
  //ui.main.removeEventListener('mousemove', e => mousemove(e));

  if(!iGame || 
      iGame.states.running == Game.runstate.LOADING || 
     !ui.states.mouseOnUi
  ) {
    ui.elemToolTip.classList.add('hidden');
    return true
  }

  ui.states.mousePos.x = e.x;
  ui.states.mousePos.y = e.y;

  ui.elemToolTip.classList.add('hidden');

  if (ui.viewPortChanged) return;
  ui.states.mapPos = main.screenToMap(ui.states.mousePos.x, ui.states.mousePos.y);
  if (ui.states.mapPos.x < 0 || ui.states.mapPos.y < 0) return;

  let layer = main.iMap.getHighestLayer(ui.states.mapPos.x,ui.states.mapPos.y);

  if (!(layer > -1)) return;

  const hasLeft  = main.iMap.tileHasNeighborLeft(
    ui.states.mapPos.x,
    ui.states.mapPos.y,
    ui.states.mapPos.layer
  );

  const hasRight = main.iMap.tileHasNeighborRight(
    ui.states.mapPos.x,
    ui.states.mapPos.y,
    ui.states.mapPos.layer
  );

  ui.elemToolTip.classList.remove('hidden');
  ui.elemToolTip.style.top  = (e.y) + 'px';
  ui.elemToolTip.style.left = (e.x+15) + 'px';

  ui.elemToolTip.innerHTML  = `X:${ui.states.mapPos.x} Y:${ui.states.mapPos.y}`;
  ui.elemToolTip.innerHTML += `<br/> layer:${layer+1}`;
  ui.elemToolTip.innerHTML += `<br/> left:${hasLeft}`;
  ui.elemToolTip.innerHTML += `<br/> right:${hasRight}`;
}

function mouseout(e) {
  //ui.elemMousePos.innerHTML = ``;
  ui.states.mousePos.x = -1;
  ui.states.mousePos.y = -1;
  ui.states.mouseOnUi = false;
  if (!ui.mouseOnContent ) {
    //window.history.replaceState(null, null, '/');
  }
}

ui.init = iGame => {
  //console.log(iGame);

  headerNav01.addEventListener('click',e => {
    console.log('jasonMapData toogle');
    jasonMapData.classList.toggle('hidden')
  });

  ui.main.addEventListener('mousemove', e => mousemove(e,iGame) );
  ui.main.addEventListener('mouseout',  e => mouseout(e)  );
  ui.main.addEventListener('click',     e => click(e)     );

  const loader = document.getElementById('loader')

  iGame.states.subscribe('ui-running','running',(newVal,oldVal) => {
    //console.log('ui','running',{newVal,oldVal})

    switch (newVal) {
      case Game.runstate.LOADING:
        ui.elemToolTip.classList.add('hidden');
        ui.wrapper.classList.add('loading');
        ui.main.style.background = 'rgba(33,33,33,1)';
        loader.classList.remove('hidden');
        break;

     case Game.runstate.RUNNING:
        ui.wrapper.classList.remove('loading');
        ui.main.style.background = 'transparent';
        loader.classList.add('hidden');
        break;

      case Game.runstate.PAUSED:
        ui.main.style.background = 'rgba(0,0,0,0.3)';
        break;
    }
  });


  iGame.states.setRenderer('fps',(newVal,oldVal,element) => {
    return `fps:${newVal.toString().padStart(3,'0')}`;
  });

  iGame.states.setRenderer('frameDelta',(newVal,oldVal,element) => {
    return `Δ:${iGame.states.frameDelta}ms`;
  });

  iGame.states.addRenderCondition('framesSinceStart',(newVal,oldVal,element) => {
    return (newVal % 20 === 0)
  });


  // iGame.states.subscribe(
  //   'ui-framesSinceStart',
  //   'framesSinceStart',
  //   (newVal) => {
  //     const property = 'framesSinceStart';
  //     //console.log(property,newVal);
  //     const elem = document.querySelector(`[data-binding="${property}"]`);
  //     if (!elem) {
  //       console.log('could not find element for '+property)
  //       return false;
  //     }; 
  //     elem.textContent = newVal;
  //   }
  // );

  //  iGame.states.subscribe(
  //   'ui-fps',
  //   'fps',
  //   (newVal) => {
  //     const property = 'fps';
  //     //console.log(property,newVal);
  //     const elem = document.querySelector(`[data-binding="${property}"]`);
  //     if (!elem) {
  //       console.log('could not find element for '+property)
  //       return false;
  //     }; 
  //     elem.textContent = 
  //   }
  // );

   
}







export default ui
