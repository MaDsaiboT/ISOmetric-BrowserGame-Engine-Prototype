import { router, loadHTML} from './router.js';
import { ui }     from './ui.js';
import { Game}    from '../GAME/Game.js';

const navUserActions  = document.getElementById('userActions');
const content         = document.getElementById('content');
const contentClose    = document.getElementById('contentClose');
const contentWraper   = document.getElementById('contentWraper');

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


let modal = null;
router.addObserver({
  name: 'login',
  callback: async (params, cur, last) => {

    if (!params.name) {
      console.log(modal?.nodeName);
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
    navUserActions.classList.remove('loggedIn');
    loadHTML(navUserActions, 'loggedOut.html');
  }
});

router.addObserver({
  name: 'signup',
  callback: async (params, cur, last) => {
    console.log(modal?.nodeName);
    if(!modal?.nodeName) modal = await ui.getModalWindow();
    else modal.open();
    await loadHTML(modal, 'signUp.html');
    
  }
});

router.addObserver({
  name: 'home',
  callback: () => {
    modal = null;
  }
},'auth-home');


const login = async name => {
  const userName = name.trim().slice(0, 20);
  router.loggedIn = true;
  localStorage.setItem('userName', userName);
  navUserActions?.classList?.add('loggedIn');
  await loadHTML(navUserActions, 'loggedIn.html');
  if (router.routeLast.name === 'login') modal.close();

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

const iGame = new Game();
iGame.states.subscribe('router-running', 'running', (newVal, oldVal) => {
  //console.log('ui','running',{newVal,oldVal})

  switch (newVal) {
    case Game.runstate.LOADING:
      hideContentModal();
      break;

    case Game.runstate.RUNNING:
      //if (oldVal === Game.runstate.LOADING) router.route();
      break;

    case Game.runstate.PAUSED:
      break;
  }
});

class auth {

}

export { auth };
export default auth;