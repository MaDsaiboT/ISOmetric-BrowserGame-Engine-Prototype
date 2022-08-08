import ecs from '../ecs.js'

const system_movement = _ => {
  //var start = window.performance.now();
  const entities = ecs.entities
    .filter(ent=>ent.active)
    .filter(ent=>ent.tags.has('moving'))
    .filter(ent=>ent.has('position'))
    .filter(ent=>ent.has('targetPos'))
  // var end = window.performance.now();
  // var time = end - start;

  // console.log('system_movement - filter:',time.toFixed(5),'ms');
  // console.log('system_movement - found:', entities.length);

  entities.forEach(entity => {

    //console.log(entity,entity.position,entity.targetPos)
    if ( entity.position.x != entity.targetPos.x 
      || entity.position.y != entity.targetPos.y
    ) {
      console.log('move',entity.position,entity.targetPos)
      easeTo( entity.position, entity.targetPos );
    }

    if ( entity.position.x == entity.targetPos.x 
      && entity.position.y == entity.targetPos.y
    ) {
      entity.componentRemove('targetPos');
      entity.tags.delete('moving');
    }
  })
}

const easeTo = (position, targetPos, ease=0.05) => {
  const dx = targetPos.x - position.x;
  const dy = targetPos.y - position.y;
  position.x += dx * ease;
  position.y += dy * ease;
  if ( Math.abs(dx) < 0.05 
    && Math.abs(dy) < 0.05
  ) {
    position.x = targetPos.x;
    position.y = targetPos.y;
  }
}

export default system_movement