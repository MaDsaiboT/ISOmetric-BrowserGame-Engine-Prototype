const runstate = {
  PAUSED: 'paused',
  RUNNING: 'running',
  LOADING: 'loading',

  get: name => {
    name = String(name).toUpperCase();
    if (this.has(name)) return this[name];
    return false;
  },

  set: name => false,

  has: name => {
    const _name = String(name).toUpperCase();
    const res = runstate.hasOwnProperty(_name);
    //console.log('runstate has:',name, _name,res);
    return res;
  }
};

let states = {
  fps: 0,
  frameDelta: 0,
  framesSinceStart: 0,
  running: runstate.LOADING,

  _observers: [],
  _renderers: new Map(),
  _renderConditions: new Map(),
  _renderClear: new Map([
    ['fps', true],
    ['frameDelta', true],
    ['framesSinceStart', false]
  ]),

  subscribe: (name, property, callback) => {
    name = states._observers.length + name;
    //console.log('Game.states ',`add observer ${name} for property ${property}` );
    //callback = callback.bind(this);
    states._observers.push({ name, property, callback});
    //console.log('subscribe',{property, callback})
    //console.log({obs})
  },

  addRenderCondition: (property, func) => {
    if (!states._renderConditions.has(property))
      states._renderConditions.set(property, []);

    states._renderConditions.get(property).push(func);
  },

  setRenderer: (property, func) => {
    if (!states.hasOwnProperty(property) || typeof func != 'function') {
      console.warn(`could not set renderer for ${property}`);
      return false;
    }
    states._renderers.set(property, func);
  }
};

let handler = {
  get: (target, property) => {
    return target[property];

    if (![undefined, 'function'].includes(typeof target[property]))
      console.log('get', { target, property });
  },

  set: (target, property, value) => {
    if ([undefined, 'function'].includes(typeof target[property])) return;
    if (String(property).startsWith('_')) return;
    const oldVal = target[property];
    const newVal = value;

    if (newVal === oldVal) return true;
    //validate
    if (typeof newVal != typeof oldVal) {
      console.warn(
        `invalid type ${typeof newVal} of value [${newVal}] for property ${property}`
      );
      return true;
    }
    //console.log('Game.states',property,{newVal,oldVal});
    switch (property) {
      case 'running':
        if (!runstate.has(newVal)) {
          console.warn(`invalid value "${newVal}" for gameStates.runstate`);
          return true;
        }
        break;
    }
    target[property] = newVal;
    //console.log(target._observers)

    // -------read only data-bind ----------------

    //find elements
    const elements = document.querySelectorAll(`[data-binding="${property}"]`);
    // if elements have been found
    if (elements.length > 0) {
      // loop elements
      elements.forEach(element => {
        if (target._renderConditions.has(property)) {
          const results = target._renderConditions.get(property).map(func => {
            return func(newVal, oldVal, element);
          });
          if (results.includes(false)) {
            if (target._renderClear.get(property)) element.textContent = '';
            return;
          }
        }

        // look if there is a renderer registered for this prperty
        if (target._renderers.has(property)) {
          // if there is a renderer use it to render newVal
          const renderer = target._renderers.get(property);
          element.textContent = renderer(newVal, oldVal, element);
        } else {
          // if not just apply the newValue
          element.textContent = newVal;
        }
      });
    }

    target._observers
      .filter(o => o.property === property)
      .forEach(o => o.callback(newVal, oldVal));

    return true;
  }
};

states = new Proxy(states, handler);

class Game {
  static instance = null;
  static runstate = runstate;

  constructor() {
    if (Game.instance !== null) return Game.instance;
    Game.instance = this;

    this.states = states;

    this.keyPause = 'KeyP';
    this.keyLoad = 'KeyL';

    window.addEventListener('keydown', e => {
      //console.log('keydown');

      // prettier-ignore
      switch (e.code) {
        case this.keyPause: this.pause(); break;
        case this.keyLoad:  this.load();  break;

        default:
          // no default behavior needed here yet
          break;
      }
    });
  }

  // prettier-ignore
  pause() {
    switch (this.states.running) {
      case runstate.LOADING: return;                                 break;
      case runstate.PAUSED:  this.states.running = runstate.RUNNING; break;
      case runstate.RUNNING: this.states.running = runstate.PAUSED;  break;

      default:
        console.warn(`unsuported runstate ${this.states.running}`);
        break;
    }
  }

  // prettier-ignore
  load() {
    switch (this.states.running) {
      case runstate.LOADING: this.states.running = runstate.RUNNING; break;
      case runstate.PAUSED:  this.states.running = runstate.LOADING; break;
      case runstate.RUNNING: this.states.running = runstate.LOADING; break;

      default:
        console.warn(`unsuported runstate ${this.states.running}`);
        break;
    }
  }
}

const iGame = new Game();

iGame.states.subscribe('main-running', 'running', (newVal, oldVal) => {
  //console.log('main','running',{newVal,oldVal})

  switch (newVal) {
    case Game.runstate.LOADING:
      console.log('\n────── loading ─────────────────');
      iGame.states.framesSinceStart = 0;
      iGame.states.frameDelta = 0;
      iGame.states.fps = 0;
      //console.clear();
      break;

    case Game.runstate.RUNNING:
      console.log('\n────── running ─────────────────');
      break;

    case Game.runstate.PAUSED:
      console.log('\n────── paused  ─────────────────');
      //const ent = ecs.entityGetByName('cube-001');
      //console.log(ent.serialize());
      break;
  }
});


export { Game };
