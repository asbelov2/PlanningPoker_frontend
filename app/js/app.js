import Router from './router';
import Render from './render';
import * as SignalR from '@microsoft/signalr';

async function mainFunction() {
  console.log('123');

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

  router
    .add('roomlogin', () => {
      console.log('welcome in room-login page');
      render.RenderLoginPage();

      document.getElementById("login-button").addEventListener("click", function (e) {
        let username = '';
        username = document.getElementById("login-name").value;
        connection.invoke("Login", username);
        document.getElementById("profile-name").innerHTML = username;
      });
    })

    .add('room', () => {
      console.log('welcome in room page');
      render.RenderRoomPage();
    })

    .add('', async () => {
      console.log('welcome in room-create page');
      render.RenderCreateRoomPage();
      let roomname = '';
      let username = '';
      let deck = '';
      document.getElementById("create-room-button").addEventListener("click", async function (e) {
        console.log('123');
        document.getElementById("profile-name").innerHTML = username;
        roomname = document.getElementById("create-room-name").value;
        username = document.getElementById("create-room-username").value;
        await connection.invoke("Login", username);
        let user;
        await fetch(`https://localhost:44356/api/user/GetByConnectionId?connectionId=${connectionId}`, {
            method: 'GET',
          })
          .then(async response => {
              if (response.status !== 200)
                console.log(`Looks like there was a problem. Status Code: ${response.status}`);
              console.log(response);
              return await response.json();
            })
            .then(data => {
              user = data;
            })
          .catch(err => {
            throw(err);
          });
        
        console.log(user);

        fetch(`https://localhost:44356/api/room?hostId=${user.id}&name=${roomname}&password=&cardInterpretation=days`, {
            method: 'POST',
          })
          .then(
            function (response) {
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }
            }
          )
          .catch(function (err) {
            console.log('Fetch 2 Error:', err);
          });
      });
    });

  connection.start().then(function () {
  connectionId = connection.connectionId;
  let render = new Render(connection);

  })
}

(async () => {
  await mainFunction();
})();