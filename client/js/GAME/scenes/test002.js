import { Scene }              from '/js/GAME/Scene.js';
import { iGame, runstate }    from '/js/GAME/Game.js';
import { iMap, drawViewport } from '/js/main.js';
import { ecs }                from '/js/ECS/ecs.js';
import { iUserInput }         from '/js/ECS/systems/userInput.js';
import { router }             from '/js/UI/router.js';

export default class test002 extends Scene{
  progress = 0;

  constructor(){
    super();
    //this.load();
  }

  async load() {

    console.log('teeeeeeest');
    // clear watever might be loaded in ecs
    ecs.clear();

    // load map
    await iMap.load('map003');

    // setup systems
    await ecs.systemAdd('selectOnClick', { priority: 100, active: true });
    await ecs.systemAdd('walkPaths',     { priority: 200, active: false });
    await ecs.systemAdd('movement',      { priority: 400, active: true });
    await ecs.systemAdd('facing',        { priority: 410, active: true });
    await ecs.systemAdd('drawCubes',     { priority: 500, active: true });

    ecs.systemGet('drawCubes').runOnPause = true;
    ecs.systemGet('selectOnClick').runOnPause = true;

    await ecs.sortSystems();


    // setup entities 
    const ent1 = ecs.entityCreate(`cube-001`, true, ['position', 'facing']);
    ent1.position.x = 1;
    ent1.position.y = 1;

    ent1.add('targetPos', ecs.components.get('targetPos'));
    ent1.targetPos.x = 1;
    ent1.targetPos.y = 1;

    const path1 = ecs.components.get('path');
    path1.step = 0;
    path1.steps.push({ x: 1, y: 1, layer: 0 });
    path1.steps.push({ x: 1, y: 2, layer: 0 });
    path1.steps.push({ x: 1, y: 3, layer: 0 });
    path1.steps.push({ x: 0, y: 3, layer: 0 });
    path1.steps.push({ x: 1, y: 3, layer: 0 });
    path1.steps.push({ x: 1, y: 4, layer: 0 });
    path1.steps.push({ x: 1, y: 3, layer: 0 });
    path1.steps.push({ x: 1, y: 2, layer: 0 });
    ent1.add('path', path1);

    ent1.tags.add('moving');
    ent1.tags.add('selectable');


    // finalize 
    drawViewport(iUserInput, false);
    //router.navigateTo('/');
    iGame.states.running = runstate.RUNNING;

  }
}

const scene = new test002();