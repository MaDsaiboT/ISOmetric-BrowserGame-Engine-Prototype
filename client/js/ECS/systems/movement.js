"use strict";
import ecs from '../ecs.js'

const system_movement = () => {

  const entities = ecs.getActiveEntities()
    .filter(ent=>ent.tags.has('moving'))
    .filter(ent=>ent.has('position'))
    .filter(ent=>ent.has('targetPos'))

  entities.forEach(entity => {

    if ( entity.position.x != entity.targetPos.x ||
         entity.position.y != entity.targetPos.y
    ) {
      easeTo( entity.position, entity.targetPos );
    }

    if ( entity.position.x == entity.targetPos.x &&
         entity.position.y == entity.targetPos.y
    ) {
      entity.tags.delete('moving');
    }
  })
}

const easeTo = (position, targetPos, ease=0.05) => {
  const dx = targetPos.x - position.x;
  const dy = targetPos.y - position.y;
  position.x += dx * ease;
  position.y += dy * ease;
  if ( Math.abs(dx) < 0.05 &&
       Math.abs(dy) < 0.05
  ) {
    position.x = targetPos.x;
    position.y = targetPos.y;
  }
}

export default system_movement