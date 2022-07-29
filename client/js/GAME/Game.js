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


const states = new Proxy({
    fps: 0,
    running: runstate.LOADING,

    _observers: [],

    subscribe: (name, property, callback) => {
      name = states._observers.length + name;
      console.log('Game.states ',`add observer ${name} for property ${property}` );
      states._observers.push({name, property, callback});
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

      if (newVal === oldVal) return true
      //validate 
      if (typeof newVal !== typeof oldVal) return false
      //console.log('Game.states',property,{newVal,oldVal});
      switch(property){
        case 'running': 
          if (!runstate.has(newVal)) {
            console.warn(`invalid value "${newVal}"(${typeof newVal}) for gameStates.runstate`);
            return true
          } 
          break;
      } 
      target[property] = newVal;
      const observers = target._observers.filter(o => o.property === property);
      console.log(target._observers)
      for (let observer of observers) observer.callback(newVal, oldVal);
      return true
    }

    
  }
);


export class Game {
  static runstate = runstate
  constructor(){
    this.states = states;
    
    this.pauseKey = 'KeyP';

    window.addEventListener( 'keydown',  e => {
      if (e.code === this.pauseKey) this.pause()
    });
  }

  pause() {
    switch (this.states.running){
      case runstate.LOADING: return;                                 break;
      case runstate.PAUSED:  this.states.running = runstate.RUNNING; break;
      case runstate.RUNNING: this.states.running = runstate.PAUSED;  break;
    }
  }
  

  
}

