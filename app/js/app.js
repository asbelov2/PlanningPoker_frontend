import Router from './router';
import Render from './render';
import SignalR from './signalr';
import Api from './api';
import Store from './store';
import Handlers from './handlers';
import Listeners from './listeners';

async function mainFunction() {
  const store = Store.instance;
  const router = Router.instance;
  await Handlers.initHandlers();

  router
    .add('roomlogin', async () => {
      await Render.RenderLoginPage();
    })

    .add('roomlobby', async () => {
      await Render.RenderRoomPage();
    })

    .add('roomcreate', async () => {
      await Render.RenderCreateRoomPage();
    })

    .add('roomdeckcreate', async () => {
      await Render.RenderDeckCreatePage();
    })

    .add(/roomenter.*/, async() => {
      store.roomId = window.location.href.match(/(?<=#roomenter).*/)[0];
      router.navigate('roomlogin');
    })

    .add('', async () => {
      router.navigate('roomcreate');
    });

    Listeners.initAllListeners();


}

(async () => {
  await mainFunction();
})();