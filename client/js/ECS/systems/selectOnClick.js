'use strict';
import ecs from '../ecs.js';
import { calcDistance } from '../../_utils/utils.js'; 
import { mapToScreen }  from '../../main.js';

//import ui from '../../UI/ui.js';

import userInput from './userInput.js';

const iUserInput = new userInput();
const lastPos = { x: 0, y: 0 };
const mousePos = {};

const system_selectOnClick = () => {
  //const mousePos = Object.assign({},ui.mousePos);

  if (!iUserInput.leftMouse) return;
  
  if (iUserInput.coord.x === lastPos.x && iUserInput.coord.y === lastPos.y)
    return;

  mousePos.x = lastPos.x = iUserInput.coord.x;
  mousePos.y = lastPos.y = iUserInput.coord.y;

  const entities = ecs
    .getActiveEntities()
    .filter(ent => ent.tags.has('selectable'))
    .filter(ent => ent.has('position'));

  entities.forEach(e => e.tags.delete('selected'));

  const res = getNearest(mousePos, entities);

  if (res.entity && res.dist < 30) {
    //console.log(res.entity.name, res.dist);
    res.entity.tags.add('selected');
  }
};

function getNearest(needle, haystack) {
  let minDist = Number.MAX_VALUE;
  let closest = null;
  for (let i = 0; i < haystack.length; i++) {
    let dist = calcDistance(needle, mapToScreen(haystack[i].position));
    if (dist < minDist) {
      minDist = dist;
      closest = haystack[i];
    }
  }
  return { entity: closest, dist: Math.floor(minDist) };
}

export default system_selectOnClick;
