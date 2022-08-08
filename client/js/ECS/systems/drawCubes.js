import ecs from '../ecs.js';
import map from '../../map.js'

import { ctxInteract, viewPortOffset} from '../../main.js';


const system_drawCubes = _ => {
  const iMap = new map();

  var start = window.performance.now();
  const entities = ecs.entities
    .filter(ent=>ent.active)
    .filter(ent=>ent.has('position'))

  var end = window.performance.now();
  var time = end - start;

  // console.log('system_drawCubes - filter:',time.toFixed(5),'ms');
  // console.log('system_drawCubes - found: ',entities.length);

  entities.forEach(entity => {
    iMap.drawCaracter(entity.position,70,ctxInteract,viewPortOffset);
  })
}


export default system_drawCubes