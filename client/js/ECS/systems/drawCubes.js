'use strict';
import ecs from '../ecs.js';
import map from '../../map.js';

import { ctxInteract, viewPortOffset } from '../../main.js';
const iMap = new map();

const system_drawCubes = () => {
  ecs
    .getActiveEntities()
    .filter(ent => ent.has('position'))
    .forEach(entity => {
      if (entity.tags.has('selected'))
        iMap.drawTile(entity.position, 70, ctxInteract, viewPortOffset);

      iMap.drawCaracter(entity.position, 70, ctxInteract, viewPortOffset);
    });
};

export default system_drawCubes;
