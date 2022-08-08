import ecs from '../ecs.js'

const system_walkPaths = _ => {
  //var start = window.performance.now();
  const entities = ecs.entities
    .filter(ent=>ent.active)
    .filter(ent=>ent.has('position'))
    .filter(ent=>ent.has('path'))


  //console.log('system_walkPaths');
  // var end = window.performance.now();
  // var time = end - start;

  // console.log('system_movement - filter:',time.toFixed(5),'ms');
  // console.log('system_movement - found:', entities.length);

  entities.forEach(entity => {

  
  })
}

export default system_walkPaths