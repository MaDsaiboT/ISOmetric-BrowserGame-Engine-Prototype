import { Game } from '../GAME/Game.js';

class Router {

  constructor() {
    // singleton 
    if (Router.instance instanceof Router) return Router.instance; 
    Router.instance = this;

    // prettier-ignore
    this.routes = [
      {path: '/',                name: 'home',     needsLogin: false},
      {path: '/login/:name',     name: 'login',    needsLogin: false},
      {path: '/login',           name: 'login',    needsLogin: false},
      {path: '/signup',          name: 'signup',   needsLogin: false},

      {path: '/logout',             name: 'logout',   needsLogin: true},
      {path: '/profile/:name',      name: 'profile',  needsLogin: true},

      {path: '/settings/:category', name: 'settings', needsLogin: true},
      {path: '/settings',           name: 'settings', needsLogin: true},
    ];

    this.baseTitle = document.title;
    this.observers = new Map();
    this.routeFallback = {
      route: this.routes[0],
      result: null
    };

    // states
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    this.routeCurrent = this.routes[0];
    this.routeLast = {};
    this.loggedIn = false;
    this.urlOrigin = new URL(window.location.href).origin;

    console.log(this.urlOrigin);
  }

  #pathToRegex(path) {
    return new RegExp(
      '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '(.+)') + '$'
    );
  }

  #getParams(match) {
    if (!match.result) return {};
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
      result => result[1]
    );

    return Object.fromEntries(
      keys.map((key, i) => {
        return [key, values[i]];
      })
    );
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  async route() {
    const timerLable = `route ${window.location.pathname}`.padEnd(35,' ');
    console.time(timerLable);

    const evaluateRoute = route => {
      // if (typeof route.condition == 'function' && !route.condition()) return {
      //   route: route,
      //   result: null
      // }
      return {
        route: route,
        result: location.pathname.match(this.#pathToRegex(route.path))
      };
    };

    const potentialMatches = this.routes.map(route => evaluateRoute(route));
    //console.dir(potentialMatches);

    let match = potentialMatches.find(
      potentialMatch => potentialMatch.result !== null
    );

    if (!match) {
      match = this.routeFallback;
      //window.history.replaceState(null, null, this.routeFallback.route.path);
    }

    const params = this.#getParams(match);

    if (this.routeCurrent.name !== match.route.name) {
      this.routeCurrent = Object.assign({}, match.route);
      document.title = `${this.baseTitle} - ${this.routeCurrent.name}`;
    }

    if (this.routeCurrent.name !== this.routeLast?.name) {
      this.routeLast = Object.assign({}, this.routeCurrent);
    } else if (!params?.length) {
      //console.timeEnd(`route ${window.location.pathname}`);
      //return this;
    }

    //console.log(`route ${location.pathname}`);
    //if (params) console.dir(params);
    this.#onRouteChange(params);
    console.timeEnd(timerLable);
    return this;
  }

  async navigateTo(strurl) {
    let url = new URL(strurl, this.urlOrigin);
    await history.pushState(null, null, url);
    router.route();
  }

  addObserver(observer, id = observer.name, warn = true) {
    const o = this.observers;
    if (warn && o.has(id)) {
      console.warn(`observer with id ${id} was overwritten`);
    }

    //console.log({id, observer}, typeof observer.callback)
    if (typeof observer.name !== 'string') {
      console.warn(`observer ${id} could not be set - no path-name found`);
      return;
    }

    if (typeof observer.callback !== 'function') {
      console.warn(
        `observer ${id} could not be set - no callback-function found`
      );
      return;
    }

    //console.log(`router add observer ${id} for rout ${observer.name}`)
    o.set(id, observer);
  }

  removeObserver(id) {
    if (this.observers.has(id)) this.observers.delete(id);
  }

  #onRouteChange(params) {
    let id, observer;
    //console.log('onRouteChange',this.routeCurrent.name)
    const matchingObservers = new Map(
      [...this.observers].filter(([id, o]) => o.name === this.routeCurrent.name)
    );
    for ([id, observer] of matchingObservers) {
      observer.callback(params, this.routeCurrent, this.routeLast);
    }
  }

}

const router = new Router();

// react to user navigating around history
window.addEventListener('popstate', e => {
  router.route();
});

// react to user cliking on links / submit buttons
document.body.addEventListener('click', e => {
  e.preventDefault();

  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigateTo(e.target.href);
  }
  if (e.target.matches('[type=submit]')) {
    e.preventDefault();
    formHandler(e.target.form);
    return false;
  }
});

const loader = document.getElementById('loader');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// the html cache
const htmlCache = new Map();

// load html from file and render it to an html element
// and / or cache it
const loadHTML = async (element, filename, useCache = true, reload = false) => {
  const file = filename;
  if (!file) return;
  if (reload && htmlCache.has(file)) htmlCache.remove(file);
  if (element && useCache && htmlCache.has(file)) {
    element.innerHTML = htmlCache.get(file);
    return;
  }
  if (element) element.innerHTML = null;
  const html = await (await fetch(`/html/${file}`)).text();
  if (element) element.innerHTML = html;
  if (useCache && htmlCache.has(file)) htmlCache.set(file, html);
  //loader.classList.add('hidden');
  return;
};

const formHandler = form => {
  console.log(formHandler, form);
  let element;
  let data = [];
  for (element of form.elements) {
    data.push({
      type: element.type,
      name: element.name,
      value: element.value
    });
  }

  if (data.find(element => element.name === 'login')) {
    const name = data.find(element => element.name === 'name').value;
    if (name.length > 2) router.navigateTo(`/login/${name}`);
  }
};

let isActiveContentModal = false;
const showContentModal = () => {
  if (isActiveContentModal) return;
  contentWraper.classList.add('active');
  isActiveContentModal = true;
};

const hideContentModal = () => {
  if (!isActiveContentModal) return;
  contentWraper.classList.remove('active');
  isActiveContentModal = false;
};

const navUserActions  = document.getElementById('userActions');
const content         = document.getElementById('content');
const contentClose    = document.getElementById('contentClose');
const contentWraper   = document.getElementById('contentWraper');
const minimap         = document.getElementById('canvasMapBufferContainer');

const login = async name => {
  const userName = name.trim().slice(0, 20);
  router.loggedIn = true;
  localStorage.setItem('userName', userName);
  navUserActions?.classList?.add('loggedIn');
  await loadHTML(navUserActions, 'loggedIn.html');
  if (router.routeLast.name === 'login') hideContentModal();

  //give the browser a chance to catch up the dom
  window.setTimeout(async () => {
    //update proflile link
    document.querySelector('[href="/profile"]').href += `/${userName}`;
    document
      .querySelector('.avatar')
      .setAttribute('data-label', userName.substr(0, 2).toUpperCase());
  }, 500);
};

if (localStorage.userName) {
  login(localStorage.userName);
} else {
  await loadHTML(navUserActions, 'loggedOut.html');
  ['logIn.html', 'signUp.html'].forEach(file => loadHTML(null, file, true));
}

//loadHTML(navUserActions,'loggedIn.html');
//navUserActions.classList.add('loggedIn');

contentClose.addEventListener('click', e => {
  window.history.replaceState(null, null, '/');
  hideContentModal();
});

router.addObserver({
  name: 'home',
  callback: async (params, cur, last) => {
    hideContentModal();
  }
});

router.addObserver({
  name: 'login',
  callback: async (params, cur, last) => {
    //console.log({cur,last});
    //if (cur.name != last.name) hideContentModal();
    //
    if (!params.name) {
      const res = await loadHTML(content, 'logIn.html');
      showContentModal();
    }

    if (params?.name?.length > 2) login(params.name);
  }
});

router.addObserver({
  name: 'logout',
  callback: async params => {
    router.loggedIn = false;
    navUserActions.classList.remove('loggedIn');
    loadHTML(navUserActions, 'loggedOut.html');
  }
});

router.addObserver({
  name: 'signup',
  callback: async (params, cur, last) => {
    //hideContentModal();
    await loadHTML(content, 'signUp.html');
    showContentModal();
  }
});

const iGame = new Game();
iGame.states.subscribe('router-running', 'running', (newVal, oldVal) => {
  //console.log('ui','running',{newVal,oldVal})

  switch (newVal) {
    case Game.runstate.LOADING:
      hideContentModal();
      break;

    case Game.runstate.RUNNING:
      if (oldVal === Game.runstate.LOADING) router.route();
      break;

    case Game.runstate.PAUSED:
      break;
  }
});

export { router };
export default router;
