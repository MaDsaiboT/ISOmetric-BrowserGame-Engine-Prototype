"use strict";
import ecs from '../ecs.js'

const system_walkPaths = () => {
  const entities = ecs.getActiveEntities()
    .filter(ent=>ent.has('position'))
    .filter(ent=>ent.has('targetPos'))
    .filter(ent=>ent.has('path'))

  entities.forEach(entity => {
    let step = entity.path.step || 0;
    let stepTarget = entity.path.steps[step];

    if ( entity.position.x == stepTarget.x && 
         entity.position.y == stepTarget.y 
    ) {
      //get next step
      step++;
      if (step > entity.path.steps.length - 1) step = 0;
      stepTarget = entity.path.steps[step];

      //updaze components data
      entity.path.step = step;
      entity.targetPos.x = stepTarget.x;
      entity.targetPos.y = stepTarget.y;
      entity.tags.add('moving');
    }
  })
}

export default system_walkPaths