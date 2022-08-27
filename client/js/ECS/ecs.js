'use strict';
import { getMaxStringLength } from '../_utils/utils.js';
import { iGame, runstate }    from '../GAME/Game.js';

// this extension to the native Map object exists to deliver deep clones
class componentsMap extends Map {
  get(property) {
    if (super.has(property))
      return JSON.parse(JSON.stringify(super.get(property)));
    else return super.get(property);
  }
}

class ecs {
  static entities = [];
  static entitiesMap = new Map();
  static systems = [];
  static components = new componentsMap();

  static _cache = new Map();

  static generateId() {
    return (this.entities.length + 1).toString().padStart(12, '0');
  }

  static entityCreate(name, active = false, components = [], tags = []) {
    const id = ecs.generateId();
    const entity = new Entity(id, name, active);
    let compName, tag;
    for (compName of components) {
      if (ecs.components.has(compName)) {
        const component = ecs.components.get(compName);
        entity.add(compName, component);
      } else {
        console.log(`component ${compName} not found`);
      }
    }

    for (tag of tags) entity.tags.add(tag);

    ecs.entities.push(entity);
    return entity;
  }

  static clear() {
    ecs.entities = [];
    ecs.systems = [];
    ecs._cache.clear();
  }

  static entityGetByName(name) {
    return ecs.entities.find(ent => ent.name === name) || null;
  }

  static systemGet(name) {
    const system = ecs.systems.find(sys => sys.name === name);
    return system;
  }

  static async systemAdd(name,{ priority = 200, active = false, runOnPause = false }) {
    if (typeof name !== 'string') {
      console.warn(`ecs.systemAdd: can not add system ${name}, given name is not a string`);
      return false;
    }

    if (!!ecs.systemGet(name)) {
      console.warn(`ecs.systemAdd: system with name ${name} is already present`);
      return false;
    }

    await import(`${location.origin}/js/ECS/systems/${name}.js`).then(
      module => {
        const callback = module.default;
        ecs.systems.push({ name, active, priority, runOnPause, callback});
      }
    );
  }

  static infoSystems() {

    const sysNames = ecs.systems.map(sys => sys.name);
    const mNL      = getMaxStringLength(sysNames);

    //console.log(mNL,sysNames);

    ecs.systems.forEach(sys =>
      console.log(
        sys.priority
        + ' ── '
        + (sys.name + ' ').padEnd(mNL+3, '─')
        + ' '
        + (sys.active ? 'active' : 'inactive')
      )
    );
  }

  static async sortSystems() {
    await ecs.systems.sort((sysA, sysB) => sysB.priroity - sysA.priority);
    console.log('systems sorted by priority');
  }

  static runSystems() {
    ecs.systems.filter(sys => sys.active).forEach(sys => sys.callback());
  }

  static getActiveEntities() {
    if (!ecs._cache.has('activeEtities')) {
      const entities = ecs.entities.filter(ent => ent.active);
      if (!!entities.length) ecs._cache.set('activeEtities', entities);
    }
    return ecs._cache.get('activeEtities') || [];
  }

  // prettier-ignore
  static setUpComponents(){
    ecs.components.set('position',     { x: 0, y: 0, layer: 0});
    ecs.components.set('facing',       { x: 0, y: 0, alias: 'north' });
    ecs.components.set('targetPos',    ecs.components.get('position'));
    ecs.components.set('targetEntity', { id: null });
    ecs.components.set('path',         { step: 0, steps: [] });
    ecs.components.set('targetable',   { targetedBy: null });
    ecs.components.set('selectable',   { selected: false });
  }
}

ecs.setUpComponents();

class Entity {
  constructor(id, name = null, active = false) {
    this.id = id;
    this.name = name ?? id;
    this.active = active;
    this._components = new Map();
    this.tags = new Set();
    return new Proxy(this, handlerEntity);
  }

  remove(name) {
    this._components.set(name, undefined);
  }

  add(name, _object = null) {
    this._components.set(name, Object.assign({ parent: this.id }, _object));
  }

  has(property) {
    let ret = this.hasOwnProperty(property);
    if (this._components.has(property)) ret = true;
    //console.log(this,'has',property, ret)
    return ret;
  }

  serialize() {
    const s = {};
    ['id', 'name', 'active'].forEach(prop => (s[prop] = this[prop]));
    s.tags = [...this.tags];
    this._components.forEach((comp, name) => {
      comp = JSON.parse(JSON.stringify(comp)); // create deep clone
      delete comp.parent; // remove parent atribute
      s[name] = comp;
    });
    return JSON.stringify(s, null, '  ');
  }
}

const handlerEntity = {
  // has:(target, property, receiver) => {
  //   if (target._components.has(property)) return true;
  //   return Reflect.has(target,property, receiver);
  // },

  getOwnPropertyDescriptor: (target, property, receiver) => {
    //console.log('getOwnPropertyDescriptor',target, property);
    return Reflect.getOwnPropertyDescriptor(target, property, receiver);
  },

  get: (target, property, receiver) => {
    if (target?._components?.has(property))
      return target._components.get(property);

    //console.log(target.id, property);
    if (property === 'tags') return target.tags;

    //if (property.substring(0,1) == '_') return false
    return Reflect.get(target, property, receiver);
  },

  set: (target, property, value, receiver) => {
    //console.log(value,receiver)

    if (target?._components?.has(property)) {
      return target._components.set(property);
    }

    if (
      !target.hasOwnProperty(property) ||
      typeof target[property] == 'function' ||
      typeof target[property] != typeof value
    ) {
      console.error('prohibited property mutation', property, value);
      return true;
    }

    if (property === 'active' && value !== target.active) {
      ecs._cache.remove('activeEtities');
    }

    return Reflect.set(target, property, value, receiver);
  },

  deleteProperty: (target, property) => {
    console.log(deleteProperty, target.id, property);
  }
};

iGame.states.subscribe('ecs-running', 'running', (newVal, oldVal) => {
  //console.log('main','running',{newVal,oldVal})

  switch (newVal) {
    case runstate.LOADING:
      ecs.systems
        .forEach(sys => (sys.active = false));
      break;

    case runstate.RUNNING:
      ecs.systems
        .forEach(sys => (sys.active = true));
      break;

    case runstate.PAUSED:
      ecs.systems
        .filter(sys => sys.runOnPause === false)
        .forEach(sys => (sys.active = false));
      break;
  }

  ecs.infoSystems();
});

export { ecs, handlerEntity };
export default ecs;
