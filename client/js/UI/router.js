class Router {
  constructor() {

    this.routes = [
      {path: '/',                 name: 'home',     needsLogin: false},
      {path: '/login/:name',      name: 'login',    needsLogin: false},
      {path: '/login',            name: 'login',    needsLogin: false},
      {path: '/signup',           name: 'signup',   needsLogin: false},

      {path: '/logout',           name: 'logout',   needsLogin: true},
      {path: '/profile/:name',    name: 'profile',  needsLogin: true},
      {path: '/settings/:theme',  name: 'settings', needsLogin: true, condition: _ => {return this.isLoggedIn()}}
    ];

    this.observers = new Map();

    this.routeFallback = {
      route:  this.routes[0],
      result: null
    }
 
    // states 
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    this.routeCurrent = this.routes[0];
    this.routeLast    = {};

    this.loggedIn     = false;

    this.urlOrigin = new URL(window.location.href).origin
    console.log(this.urlOrigin)
  }

  pathToRegex(path) {
    return new RegExp('^'+path.replace(/\//g, '\\/').replace(/:\w+/g,'(.+)') +'$');
  }

  getParams(match) {
    if (!match.result) return {}
    const values = match.result.slice(1);
    const keys = Array
                  .from(match.route.path.matchAll(/:(\w+)/g))
                  .map(result=>result[1]);

    return Object.fromEntries(keys.map((key,i) => {
      return [key, values[i]]
    }));
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  async route() {
    console.time()
    const potentialMatches = this.routes.map(route => {
      if (typeof route.condition == 'function' && !route.condition()) return {
         route: route,
         result: null
      }
      return {
        route:  route,
        result: location.pathname.match(this.pathToRegex(route.path))
      }
    });

    //console.log(potentialMatches);

    let match = potentialMatches.find(
      potentialMatch => potentialMatch.result !== null
    );

    if (!match) {
      match = this.routeFallback;
      //window.history.replaceState(null, null, this.routeFallback.route.path);
    };
    
    if (this.routeCurrent.name != match.route.name) {
      this.routeCurrent = Object.assign({},match.route);

      //console.log(location.pathname,match.route.name);
      //console.log(potentialMatches);
      
    }

    if (this.routeCurrent.name != this.routeLast?.name) {
      this.routeLast = Object.assign({},this.routeCurrent)
    } 

    this.onRouteChange(this.getParams(match));
    console.timeEnd();
    return this;
  }

  navigateTo(strurl) {
    let url = new URL(strurl,this.urlOrigin)

    console.log('router.navigateTo',url.pathname)

    history.pushState(null, null, strurl);
    router.route();
  }

  addObserver(observer,id = observer.name, warn = true) {
    const o = this.observers
    if (warn && o.has(id)) {
      console.warn(`observer with id ${id} was overwritten`);
    }

    console.log({id, observer}, typeof observer.callback)
    if (typeof observer.name     !== 'string'   ) {
      console.warn(`observer ${id} could not be set - no path-name found`);
      return;
    }
   
    if (typeof observer.callback !== 'function') {
      console.warn(`observer ${id} could not be set - no callback-function found`);
      return; 
    }
    console.log(`router add observer ${id} for rout ${observer.name}`)
    o.set(id, observer); 
  }

  removeObserver(id) {
    const o = this.observers
    if (o.has(id)) o.delete(id)
  }
 
  onRouteChange(params) {
    let id,observer;
    console.log('onRouteChange',this.routeCurrent.name)
    const matchingObservers = new Map([...this.observers].filter(
      ([id, o]) => o.name == this.routeCurrent.name
    ));
    for ([id, observer] of matchingObservers) {
      observer.callback(params,this.routeCurrent,this.routeLast);
    }
  }
}

const router = new Router(); 

window.addEventListener('popstate', router.route());

document.body.addEventListener("click",e => {
  if(e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigateTo(e.target.href);
  }
  if(e.target.matches('[type=submit]')) {
    e.preventDefault();
    formHandler(e.target.form);
    return false;
  }
});

const loader = document.getElementById('loader')
const htmlChache = new Map();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const loadHTML = async (element,filename, useCache=false) => {
  let file = filename; 
  if (!file) return
  loader.classList.remove('hidden')
  element.innerHTML = null;

  if (useCache && htmlChache.has(file)) {
    element.innerHTML = htmlChache.get(file);
    loader.classList.add('hidden');
    return
  }

  let html = await fetch(`/html/${file}`)
      html = await html.text();

  element.innerHTML = html;
  loader.classList.add('hidden');
  return;
}

const formHandler = (form) => {
  console.log(formHandler,form);
  let element;
  let data = [];
  for ( element of form.elements ) {
    data.push({
       type: element.type,
       name: element.name,
      value: element.value
    });
  }

  if ( data.find(element => element.name == 'login') ) {
    const name = data.find( element => element.name == 'name' ).value;
    if ( name.length > 2 ) router.navigateTo(`/login/${name}`);
  }
}

let isActiveContentModal = false;
const showContentModal = () => {
  if (isActiveContentModal) return;
  contentWraper.classList.replace('hidden','active')
  isActiveContentModal = true;
}

const hideContentModal = () => {
  if (!isActiveContentModal) return;
  contentWraper.classList.replace('active','hidden')
  isActiveContentModal = false;
}


const navUserActions = document.getElementById('userActions');
const content        = document.getElementById('content');
const contentClose   = document.getElementById('contentClose');
const contentWraper  = document.getElementById('contentWraper');
  
await loadHTML(navUserActions,'loggedOut.html');
//loadHTML(navUserActions,'loggedIn.html');
//navUserActions.classList.add('loggedIn');

contentClose.addEventListener('click',e=>{
  window.history.replaceState(null, null, '/');
  hideContentModal();
});

router.addObserver({
  name: 'login', 
  callback: async (params,cur,last) => {
    console.log({cur,last});
    //if (cur.name != last.name) hideContentModal();


    if ( !params.name ) {
      const res = await loadHTML(content,'logIn.html')
      showContentModal();
    }


    if ( params?.name?.length > 2 ) {
      const userName = params.name.trim().slice(0, 20); 
      router.loggedIn = true;
      navUserActions?.classList?.add('loggedIn');
      await loadHTML(navUserActions,'loggedIn.html');
      hideContentModal();

      //give the browser a chance to catch up the dom
      window.setTimeout(async ()=>{
        //update the proflile link
        document.querySelector('[href="/profile"]').href += `/${userName}`;
      },500);
    }

  }
});

router.addObserver({
  name: 'logout', 
  callback: async params => {
    router.loggedIn = false;
    navUserActions.classList.remove('loggedIn');
    loadHTML(navUserActions,'loggedOut.html');
  }
},'logout');

router.addObserver({
  name: 'signup', 
  callback: async (params,cur,last) => {
    //hideContentModal();
    await loadHTML(content,'signUp.html');
    showContentModal();
  }
},'signup');

router.addObserver({
  name: 'settings', 
  callback: (params,cur,last) => {
  console.log(params)
  }
},'settingsTheme');

router.route();


export default router;