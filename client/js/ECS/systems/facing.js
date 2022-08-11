 "use strict";
import ecs from '../ecs.js'
import math from '../../_utils/math.js'

const system_facing = () => {

  const entities = ecs.getActiveEntities()
    .filter(ent=>ent.has('facing'))
    .filter(ent=>ent.has('position'))
    .filter(ent=>ent.has('targetPos'))

  entities.forEach(entity => {
    let facing = {x:0,y:0,alias:null};

    facing.x = math.clamp(Math.round(entity.position.x-entity.targetPos.x),-1,1)
    facing.y = math.clamp(Math.round(entity.position.y-entity.targetPos.y),-1,1)
    facing.alias = getFacingAlias(facing);

    if (  
      getFacingAlias(facing) != null &&
      getFacingAlias(entity.facing) != getFacingAlias(facing)
    ) {
      entity.facing.x = facing.x;
      entity.facing.y = facing.y;
      entity.facing.alias = getFacingAlias(entity.facing);
    }


  })
}

const getFacingAlias = (facing) => {
  if(facing.x ==  1 && facing.y ==  0) return 'north'
  if(facing.x ==  1 && facing.y ==  1) return 'northeast'
  if(facing.x ==  1 && facing.y == -1) return 'northwest'

  if(facing.x ==  0 && facing.y ==  1) return 'east' 
  if(facing.x ==  0 && facing.y == -1) return 'west'

  if(facing.x == -1 && facing.y ==  0) return 'south' 
  if(facing.x == -1 && facing.y ==  1) return 'southeast'
  if(facing.x == -1 && facing.y == -1) return 'northwest'

  return null;
}

export default system_facing