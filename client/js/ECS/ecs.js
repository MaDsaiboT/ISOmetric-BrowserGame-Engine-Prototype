import { getMaxStringLength } from '../_utils/utils.js';

class ecs {

  static entities     = [];
  static entitiesMap  = new Map;
  static systems      = [];
  static components   = new Map();

  static generateId(){
    return (this.entities.length + 1)
      .toString()
      .padStart(12,'0')
  }

  static entityCreate(name,active=false,components=[],tags=[]) {
    const id = ecs.generateId();
    const entity = new Entity(id,name,active);
    let compName,tag;
    for (compName of components) {
      if (ecs.components.has(compName)){
        const component = ecs.components.get(compName)
        entity.componentAdd(compName,component);
      }
      else {
        console.log(`component ${compName} not found`)
      }
    }

    for (tag of tags) entity.tags.add(tag);
    
    ecs.entities.push(entity);
    return entity;
  }

  static systemGet(name) {
    const system = ecs.systems.find(system=>system.name == name);
    return system;
  }

  static async systemAdd(name, priority=200,active=false) {

    if (typeof name !== 'string') {
      console.warn(`ecs.systemAdd: can not add system  ${name}, given name is not a string`);
      return false;
    }

    if (!!ecs.systemGet(name)) {
      console.warn(`ecs.systemAdd: system with name ${name} is already present`);
      return false;
    }

    // if (typeof callback !== 'function') {
    //   console.warn(`ecs.systemAdd: can not add system  ${name}, given callback is not a function`);
    //   return false;
    // }

    let callback = null;

    await import(`${location.origin}/js/ECS/systems/${name}.js`)
    .then(module =>{
    
      const callback = module.default; 
      ecs.systems.push({
        name:     name,
        active:   active,
        priority: priority,
        callback: callback
      });
    })
  
   
 
  }

  static async sortSystems() {
    await ecs.systems.sort((sysA, sysB)=>{return sysB.priroity - sysA.priority});

    const mNL = getMaxStringLength(ecs.systems.map(sys=>sys.name));

    console.log('systems sorted')
    ecs.systems.forEach(
      sys=>console.log(
        `${sys.priority} - ${sys.name.padEnd(mNL,' ')} - ${(sys.active ? 'active' : 'inactive')}`)
    );
  }

  static runSystems() {
    ecs.systems.filter(sys=>sys.active).forEach(sys=>sys.callback())
  }

};

ecs.components.set('position',     {x:0, y:0, layer:0});
ecs.components.set('facing',       {x:0, y:0, alias:'north'});
ecs.components.set('targetPos',    {x:0, y:0, layer:0});
ecs.components.set('targetEntity', {x:0, y:0, layer:0});
ecs.components.set('path',         {step:0, steps:[]});
ecs.components.set('targetable',   {targetetBy: null});
ecs.components.set('selectable',   {selected:  false});

class Entity {
  constructor(id, name=null, active=false) {
    this.id         = id;
    this.name       = name ?? id;
    this.active     = active;
    this._components = new Map();
    this.tags        = new Set();
    return new Proxy(this,handlerEntity)
  }

  componentRemove(name) {
    this._components.set(name,undefined);
  }

  componentAdd(name,_object=null) {
    this._components.set(name,Object.assign({parent:this.id},_object));
  }

  has(property){
    let ret = this.hasOwnProperty(property);
    if (this._components.has(property)) ret = true
    //console.log(this,'has',property, ret)
    return ret;
  }
};


const handlerEntity = {


  // has:(target, property, receiver) => {
  //   if (target._components.has(property)) {
  //     return target._components.has(property);
  //   }
  //   return Reflect.has(target,property, receiver);
  // },
  // 
  getOwnPropertyDescriptor: (target, property, receiver) => {
    //console.log('getOwnPropertyDescriptor',target, property);
    return Reflect.getOwnPropertyDescriptor(target, property, receiver)
  },

  get: (target, property, receiver) => {

    if (target?._components?.has(property)) {
      return target._components.get(property);
    }

    //console.log(target.id, property);
    if (property == 'tags') 
      return target.tags

    //if (property.substring(0,1) == '_') return false 
    return Reflect.get(target,property, receiver);
  },

  set: (target, property, value, receiver) => {
    //console.log(value,receiver)
   
    if (target?._components?.has(property)) {
      return target._components.set(property);
    }

    if ( !target.hasOwnProperty(property)
      || (typeof target[property]) == 'function' 
      || (typeof target[property]) != (typeof value)
    ) {
      console.error('prohibited property mutation',property,value); 
      return true;
    }

    return Reflect.set(target, property, value, receiver);
  },

  deleteProperty: (target, property) => {
    console.log(deleteProperty,target.id,property)
  }
}

export {ecs, handlerEntity}
export default ecs;