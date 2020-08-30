import Router from './router';
import Render from './render';
import Store from './store';
import Handlers from './handlers';
import Listeners from './listeners';
import SignalR from './signalr';

async function mainFunction() {
  Listeners.initAllListeners();
  const signalR = SignalR.instance;
  await signalR.connect();
  const store = Store.instance;
  const router = Router.instance;
  await Handlers.initHandlers();

  router
    .add('roomlogin', async() => {
      await Render.renderLoginPage();
    })

    .add('roomlobby', async() => {
      await Render.renderRoomPage();
    })

    .add('roomcreate', async() => {
      await Render.renderCreateRoomPage();
    })

    .add('roomdeckcreate', async() => {
      await Render.renderDeckCreatePage();
    })

    .add(/roomenter.*/, async() => {
      store.roomId = window.location.href.match(/(?<=#roomenter).*/)[0];
      router.navigate('roomlogin');
    })

    .add('', async() => {
      router.navigate('roomcreate');
    });

  router.listen();
}

(async() => {
  await mainFunction();
})();