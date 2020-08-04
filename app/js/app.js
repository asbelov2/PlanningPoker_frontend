import Router from './router';
import * as signalR from '@aspnet/signalr';
import {
  StartConnection,
} from './signalr';

let username = '';

(async () => {let hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:44356/roomhub", {
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets
    })
    .build();
    hubConnection.serverTimeoutInMilliseconds = 1000 * 1;
    console.log(hubConnection);
    console.log(hubConnection.id);
    var connection = await hubConnection.start();

    console.log('123');
    console.log(connection);
  })()

const router = new Router({
  mode: 'hash',
  root: '/'
});

router
  .add('index', () => {
    alert('welcome in about page');
    document.getElementsByClassName('main')[0].style.display = "flex";
  })

  .add('roomlogin',async () => {

    HideByClass('main');
    HideByID('create-room');
    document.getElementById('login').style.display = "block";

    console.log('Login room page');
  })

  .add('room', () => {
    HideByID('login');
    HideByID('create-room');
    document.getElementsByClassName('main')[0].style.display = "flex";
    console.log('Create room page');
  })

  .add('', () => {
    HideByClass('main');
    HideByID('login');
    console.log('Create room page');
  });

function HideByID(element_id) {
  if (document.getElementById(element_id)) {
    document.getElementById(element_id).style.display = 'none';
  } else alert("Элемент с id: " + element_id + " не найден!");
}

function HideByClass(element_class) {
  if (document.getElementsByClassName(element_class)) {
    document.getElementsByClassName(element_class)[0].style.display = 'none';
  } else alert("Элемент с class: " + element_class + " не найден!");
}