import Router from './router';
import Render from './render';
import * as SignalR from '@microsoft/signalr';

async function mainFunction() {
  let render;

  const connection = new SignalR.HubConnectionBuilder()
    .withUrl("https://localhost:44356/roomhub", {
      skipNegotiation: false,
      transport: SignalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .build();

  let connectionId = '';

  const router = new Router({
    mode: 'hash',
    root: '/'
  });

  await connection.start().then(() => {
    connectionId = connection.connectionId;
  })

  render = new Render(connection);

  router
    .add('/roomlogin/', async () => {
      console.log('welcome in room-login page');
      await render.RenderLoginPage();

      document.getElementById("login-button").addEventListener("click", function (e) {
        let username = '';
        username = document.getElementById("login-name").value;
        connection.invoke("Login", username);
        document.getElementById("profile-name").innerHTML = username;
      });
    })

    .add('/room/', async () => {
      console.log('welcome in room page');
      await render.RenderRoomPage();
    })

    .add('/roomcreate/', async () => {
      console.log('welcome in room-create page');
      await render.RenderCreateRoomPage();
    })

    .add('', async () => {
      router.navigate('/roomcreate/');
    });
}

(async () => {
  await mainFunction();
})();