import Router from './router';
import Render from './render';
import SignalR from './signalr';
import Api from './api';
import Store from './store';
import Handlers from './handlers'

async function mainFunction() {
  const roomId = '';
  const signalR = SignalR.instance;
  const render = new Render();
  const api = new Api();
  const store = Store.instance;
  const router = Router.instance;
  Handlers.initHandlers();

  router
    .add('roomlogin', async () => {
      console.log('welcome in room-login page');
      await render.RenderLoginPage();
    })

    .add('roomlobby', async () => {
      console.log('welcome in room page');
      await Render.RenderRoomPage();
    })

    .add('roomcreate', async () => {
      console.log('welcome in room-create page');
      await render.RenderCreateRoomPage();
    })

    .add(/roomenter.*/, async() => {
      store.roomId = window.location.href.match(/(?<=#roomenter).*/)[0];
      console.log(store.roomId);
      router.navigate('roomlogin');
    })

    .add('', async () => {
      router.navigate('roomcreate');
    });
}

(async () => {
  await mainFunction();
})();