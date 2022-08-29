import { Scene }              from '/js/GAME/Scene.js';
import { iGame, runstate }    from '/js/GAME/Game.js';
import { iMap, drawViewport } from '/js/main.js';
import { ecs }                from '/js/ECS/ecs.js';
import { iUserInput }         from '/js/ECS/systems/userInput.js';
import { router }             from '/js/UI/router.js';

export default class test001 extends Scene{
  progress = 0;

  constructor(){
    super();
    //this.load();
  }

  async load() {

    await iMap.load('map001');

    ecs.clear();
    await ecs.systemAdd('selectOnClick', { priority: 100, active: true });
    await ecs.systemAdd('walkPaths',     { priority: 200, active: false });
    await ecs.systemAdd('movement',      { priority: 400, active: true });
    await ecs.systemAdd('facing',        { priority: 410, active: true });
    await ecs.systemAdd('drawCubes',     { priority: 500, active: true });

    ecs.systemGet('drawCubes').runOnPause = true;
    ecs.systemGet('selectOnClick').runOnPause = true;

    await ecs.sortSystems();

    // entity cube-001
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

    // entity cube-002
    const ent2 = ecs.entityCreate(`cube-002`, true, ['position', 'facing']);
    ent2.position.x = 2;
    ent2.position.y = 4;

    ent2.add('targetPos', ecs.components.get('targetPos'));
    ent2.targetPos.x = 2;
    ent2.targetPos.y = 4;

    const path2 = ecs.components.get('path');
    path2.step = 0;

    path2.steps.push({ x: 2, y: 4, layer: 0 });
    path2.steps.push({ x: 2, y: 3, layer: 0 });
    path2.steps.push({ x: 2, y: 2, layer: 0 });
    path2.steps.push({ x: 2, y: 1, layer: 0 });
    path2.steps.push({ x: 3, y: 1, layer: 0 });
    path2.steps.push({ x: 3, y: 2, layer: 0 });
    path2.steps.push({ x: 3, y: 3, layer: 0 });
    path2.steps.push({ x: 4, y: 3, layer: 0 });
    path2.steps.push({ x: 5, y: 3, layer: 0 });
    path2.steps.push({ x: 5, y: 4, layer: 0 });
    path2.steps.push({ x: 4, y: 4, layer: 0 });
    path2.steps.push({ x: 3, y: 4, layer: 0 });
    ent2.add('path', path2);

    ent2.tags.add('moving');
    ent2.tags.add('selectable');

    // entity cube-003
    const ent3 = ecs.entityCreate(`cube-003`, true, ['position', 'facing']);
    ent3.position.x = 8;
    ent3.position.y = 8;

    ent3.add('targetPos', ecs.components.get('targetPos'));
    ent3.targetPos.x = 8;
    ent3.targetPos.y = 8;

    const path3 = ecs.components.get('path');
    path3.step = 0;
    path3.steps.push({ x: 8, y:  8, layer: 0 });
    path3.steps.push({ x: 8, y:  9, layer: 0 });
    path3.steps.push({ x: 7, y:  9, layer: 0 });
    path3.steps.push({ x: 6, y:  9, layer: 0 });
    path3.steps.push({ x: 5, y:  9, layer: 0 });
    path3.steps.push({ x: 5, y:  8, layer: 0 });
    path3.steps.push({ x: 4, y:  8, layer: 0 });
    path3.steps.push({ x: 3, y:  8, layer: 0 });
    path3.steps.push({ x: 3, y:  9, layer: 0 });
    path3.steps.push({ x: 3, y: 10, layer: 0 });
    path3.steps.push({ x: 3, y: 11, layer: 0 });
    path3.steps.push({ x: 4, y: 11, layer: 0 });
    path3.steps.push({ x: 5, y: 11, layer: 0 });
    path3.steps.push({ x: 5, y: 10, layer: 0 });
    path3.steps.push({ x: 6, y: 10, layer: 0 });
    path3.steps.push({ x: 7, y: 10, layer: 0 });
    path3.steps.push({ x: 7, y:  9, layer: 0 });
    path3.steps.push({ x: 8, y:  9, layer: 0 });
    ent3.add('path', path3);

    // tags
    ent3.tags.add('moving');
    ent3.tags.add('selectable');


    // finalize
    drawViewport(iUserInput, false);
    //router.navigateTo('/');
    iGame.states.running = runstate.RUNNING;
  }
}

const scene = new test001();