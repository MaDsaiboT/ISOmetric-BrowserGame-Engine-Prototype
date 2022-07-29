
const runstate = {
  PAUSED:  'paused',
  RUNNING: 'running',
  LOADING: 'loading',

  get: name => {
    name = String(name).toUpperCase();
    if (this.has(name)) return this[name];
    return false
  },

  set: name => {return false;},

  has: name => {
    const _name = String(name).toUpperCase();
    const res   = (runstate.hasOwnProperty(_name))
    //console.log('runstate has:',name, _name,res);
    return res;
  }
}


const gameStates = new Proxy({
    fps: 0,
    runstate: runstate.LOADING,

    _observers: [],

    subscribe: (property, callback) => {
      let obs = gameStates._observers
      obs.push({property, callback});
      //console.log('subscribe',{property, callback})
      //console.log({obs})
    }
  },
  {
    get: (target, property) => {
      return target[property];

      if (![undefined,'function'].includes(typeof target[property])) 
        console.log('get',{target, property})
    },

    set: (target, property, value) => {
      if ([undefined,'function'].includes(typeof target[property])) return
      if (String(property).startsWith('_')) return
      const oldVal = target[property];
      const newVal = value;
      //validate 
      if (typeof newVal !== typeof oldVal) return false
      //console.log({newVal,oldVal});
      switch(property){
        case 'runstate': 
          if (!runstate.has(newVal)) 
            console.warn(`invalid value "${newVal}"(${typeof newVal}) for gameStates.runstate`);
          return true; 
        break;
      } 



      const observers = target._observers.filter(o => o.property === property);
      target[property] = value;
      for (let observer of observers) observer.callback(newVal, oldVal);
      return true
    }

    
  }
);

class Game {
  constructor() {
    this.gameStates = gameStates
  }

}

const instance = new Game();

gameStates.subscribe('fps',(newVal,oldVal) => {
  console.log('fps changed',{newVal,oldVal})}
);

instance.gameStates.fps ++;

instance.gameStates.fps ++;

instance.gameStates.fps ++;

instance.gameStates.fps ++;

console.log(gameStates.meep);

gameStates.subscribe('runstate',(newVal,oldVal) => {
  console.log('runstate changed',{newVal,oldVal})}
);

instance.gameStates.runstate = runstate.PAUSED;

instance.gameStates.runstate = 'test';

console.log('gameStates.runstate:',gameStates.runstate);


export default instance
export {instance as Game}