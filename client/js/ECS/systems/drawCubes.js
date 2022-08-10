"use strict";
import ecs from '../ecs.js';
import map from '../../map.js'

import { ctxInteract, viewPortOffset} from '../../main.js';
const iMap = new map();

const system_drawCubes = () => {
  ecs.entities
    .filter(ent=>ent.active)
    .filter(ent=>ent.has('position'))
    .forEach(entity => {
      iMap.drawCaracter(entity.position,70,ctxInteract,viewPortOffset);
    })
}


export default system_drawCubes