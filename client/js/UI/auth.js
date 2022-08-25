import { router, loadHTML} from './router.js';
import { ui }              from './ui.js';
import { iGame, runstate }  from '../GAME/Game.js';

// preload webComponents
import compNavbarUser from './webComponents/navbar/user.js';


contentClose.addEventListener('click', e => {
  window.history.replaceState(null, null, '/');
  hideContentModal();
});

let modal = null;
router.addObserver({
  name: 'login',
  callback: async (params, cur, last) => {

    if (!params.name) {
      //console.log(modal?.nodeName);
      if(!modal?.nodeName) modal = await ui.getModalWindow();
      else modal.open();
      loadHTML(modal, 'logIn.html');
    }

    if (params?.name?.length > 2) login(params.name);
  }
});

router.addObserver({
  name: 'logout',
  callback: async params => {
    router.loggedIn = false;
    localStorage.removeItem("userName");
    document.querySelector('comp-navbar-user')?.setAttribute('logged-in',false);
  }
});

router.addObserver({
  name: 'signup',
  callback: async (params, cur, last) => {
    //console.log(modal?.nodeName);
    if(!modal?.nodeName) modal = await ui.getModalWindow();
    else modal.open();
    await loadHTML(modal, 'signUp.html');
  }
});

router.addObserver({
  name: 'home',
  callback: () => modal = null
},'auth-home');

// TODO note: this is an extremely naive implementation for now
//            no password or serverside validation is used here yet
const login = async name => {
  // remove whitepaces and clamp the name to a max string length of 20 characters
  const userName = name.trim().slice(0, 20);
  router.loggedIn = true;
  localStorage.setItem('userName', userName);
  // close the modal window
  if (router.routeLast.name === 'login') modal.close();
  // notify navbar user component about the log in state
  document.querySelector('comp-navbar-user')?.setAttribute('logged-in',true);
};

if (localStorage.userName) {
  // if there is a nuserName in localStorage log the user in
  login(localStorage.userName);
} else {
  // if not logged in preload login and signup html snipets
  ['logIn.html', 'signUp.html'].forEach(file => loadHTML(null, file, true));
}

iGame.states.subscribe('router-running', 'running', (newVal, oldVal) => {
  //console.log('ui','running',{newVal,oldVal})

  switch (newVal) {
    case runstate.LOADING:
      modal?.close();
      break;

    case runstate.RUNNING:
      //if (oldVal === Game.runstate.LOADING) router.route();
      break;

    case runstate.PAUSED:
      break;
  }
});

class auth {

}

export { auth };
export default auth;