'use strict';
import { ui } from '../UI/ui.js';
import { Scene } from '../GAME/Scene.js';

const canvasMap = document.getElementById('canvasMap');
const canvasMapBuffer = document.getElementById('canvasMapBuffer');
const canvasInteract = document.getElementById('canvasInteract');


const runstate = Object.freeze({
  LOADING: 'loading',
  PAUSED:  'paused',
  RUNNING: 'running',
});

const gamemode = Object.freeze({
  SCENESELECT: 'scene-select',
  EDITOR:      'editor',
  MANAGER:     'manager',
  STRATEGIST:  'strategist',
  TACTITION:   'tactition',
});

let states = {
  fps: 0,
  frameDelta: 0,
  framesSinceStart: 0,

  // enums
  running: Object.values(runstate)[0], //LOADING
  mode:    Object.values(gamemode)[0], //SCENESELECT
  scene: '',

  // use "enums" to declare posible values 
  _enums: new Map([
    ['running', runstate],
    ['mode',    gamemode]
  ]),
  _observers: [],
  _renderers: new Map(),
  _renderConditions: new Map(),
  _renderClear: new Map([
    ['fps', true],
    ['frameDelta', true],
    ['framesSinceStart', false]
  ]),

  subscribe: (...args) => {
    let [name, property, callback] = args;
    const callerModule = getCallerModule();
    name = `${states._observers.length}-${callerModule}-${name}`;
    //console.log('Game.states ', `add observer ${name} for property ${property}`);

    const dublicate = states._observers.find(o => o.name === name);
    if (dublicate) {
      console.warn(`Game - observer with ${name} already exists`);
      return;
    }
    states._observers.push({ name, property, callback });
    return name;
  },

  unsubscribe: (name) => {
    const index = states._observers.findIndex(item => item.name === name);
    states._observers.splice(index, 1);
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
    if ([undefined,'undefined'].includes(target[property])) {
      console.warn(
        `Game.states.get: ` +
        `\n  property ${property} not found`
      );
      return undefined;
    };
    return target[property];
  },

  set: (target, property, value, ...args) => {

    //console.log(args.calle?.prototype.name);

    //console.log({target, property, value});
    if ([undefined,'undefined'].includes(target[property])) {
      console.warn(
        `Game.states.set: ` +
        `\n  property ${property} not found`
      );
      return true;
    };
    if (String(property).startsWith('_')) return;
    const oldVal = target[property];
    const newVal = value;

    if (newVal === oldVal) return true;
    //validate

    if (target._enums.has(property)) {
      const allowedValues = Object.values(target._enums.get(property));
      if (allowedValues && !allowedValues.includes(value)) {
        console.error(
          `Game.states.set:`+
          `\n  invalid value [${value}] for [${property}]` +
          `\n  allowed values: [${allowedValues.join(', ')}]`
        );
        return true;
      }
    }
    else if (oldVal !== null && typeof newVal != typeof oldVal) {
      console.error(
        `Game.states.set:` +
        `\n  invalid type ${typeof newVal} of value [${newVal}] `+
        `\n  for property ${property}(${typeof property}:${target[property]})`
      );
      return true;
    } 
    
    target[property] = newVal;
    
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
  runstate = runstate;
  #scenes  = [
    {name: 'test001', description: 'testscene with 3 cubes moving on paths'},
    {name: 'test002', description: ''}, 
    {name: 'test003', description: ''}, 
    {name: 'test004', description: ''}, 
    {name: 'test005', description: ''}, 
  ];

  get scenes() {
    return this.#scenes;
  }

  hasScene(name) {
    return !!this.#scenes.find(scene => scene.name === name);
  }

  constructor() {
    if (Game.instance !== null) return Game.instance;
    Game.instance = this;
    this.states = states;
    this.#bindEvents();
  }

  async showSceneSelect() {
    this.sceneWindow = ui.main.querySelector('scene-window');
    if (!this.sceneWindow) {
      await Promise.all([
        import('../UI/webComponents/sceneWindow.js'),
        import('../UI/webComponents/sceneSelect.js'),
      ]);
      this.sceneWindow = document.createElement('scene-window');
      this.sceneWindow.title = 'Scene Select';
      const select = document.createElement('scene-select');
      this.sceneWindow.append(select);
      ui.main.append(this.sceneWindow);
    } else {
      this.sceneWindow.open();
    }
  }

  async startScene() {
    this.states.running = runstate.LOADING;

    if (this.states.scene === '') {
      console.log(`no scene`);
      this.showSceneSelect();
    }
    else {
      

      if (!Scene.scenes.has(this.states.scene)) {
        
        console.log(`loading scene ${this.states.scene}`);
        const filePath = `/js/GAME/scenes/${this.states.scene}.js`;
        try {
          await import(filePath);
          console.log(`${filePath} loaded`);
        } 
        catch(e) {
          console.warn(e);
          iGame.states.scene = '';
        }
        finally{
          console.dir(Scene.scenes);
        }
      }

      this.sceneWindow.close();
      await Scene.scenes.get(this.states.scene).load();
      
    }
  }

  #bindEvents() {
    this.keyPause = 'KeyP';
    this.keyLoad  = 'KeyL';

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

function getCallerModule(getStack) {
  try {
    throw new Error();
  } catch (e) {
    // remove origin url-parts from the stack 
    const str     = e.stack.replaceAll(`${location.origin}/js/`, '');

    // define regular expresion 
    const pattern = /at ([^()]*)\.| at .* \(([^()]*)\./g;

    // use a set to automatically delete duplicates.
    const modules = new Set(

      // create an array with all the parts of the string that match the pattern 
      [...str.matchAll(pattern)]

      // filter for just the relevant info
      .map(i => i[2] || i[1])
    );

    // convert the set into an array and return the last element 
    const last = [...modules].at(-1);
    return getStack ? [last,str] : last;
  }
}

const iGame = new Game();

iGame.states.subscribe('game-scene','scene', (newVal, oldVal) => {
  iGame.startScene();
});

iGame.states.subscribe('game-running', 'running', (newVal, oldVal) => {
  //console.log('main','running',{newVal,oldVal})

  switch (newVal) {
    case runstate.LOADING:
      console.log('\n────── loading ─────────────────');
      iGame.states.framesSinceStart = 0;
      iGame.states.frameDelta = 0;
      iGame.states.fps = 0;
      //console.clear();
      break;

    case runstate.RUNNING:
      console.log('\n────── running ─────────────────');
      //if (iGame.states.scene === '') iGame.startScene();
      break;

    case runstate.PAUSED:
      console.log('\n────── paused  ─────────────────');
      //const ent = ecs.entityGetByName('cube-001');
      //console.log(ent.serialize());
      break;
  }
});

export { Game, iGame, runstate, gamemode };
