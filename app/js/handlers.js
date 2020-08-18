import SignalR from './signalr';
import Render from './render';
import Store from './store';
import Api from './api';

const signalR = SignalR.instance;
const render = new Render();
const store = Store.instance;
const api = new Api();

class Handlers {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }

  static async initHandlers() {
    // удачный вход
    signalR.connection.on('onLogin', function () {
      console.log(`[handlers] Succesfully logined`);
    });

    // время вышло
    signalR.connection.on('onTimeOver', function () {
      console.log(`[handlers] Time is up`);
    });

    // все сделали выбор
    signalR.connection.on('onAllChosed', async function (round) {
      // let elem = document.createElement("p");
      // elem.appendChild(document.createTextNode("All chosed(Result: " + round.result + ")"));
      // var firstElem = document.getElementById("log").firstChild;
      // document.getElementById("log").insertBefore(elem, firstElem);

      // for (let i = 0; i < round.choices.length; i++) {
      //   elem = document.createElement("p");
      //   elem.appendChild(document.createTextNode("User " + round.choices[i].user.name + " has chosed " + round.choices[i].card.name + " card"));
      //   firstElem = document.getElementById("log").firstChild;
      //   document.getElementById("log").insertBefore(elem, firstElem);
      // }
      console.log(`[handlers] All participants chosed`);
      console.log(round);
      store.stories = await api.request('round/RoundResult', 'GET', {
        roomId: store.room.id
    });
      Render.RenderStories(store.stories);
      //TODO: сделать
    });

    // пользователь выбрал карту
    signalR.connection.on('onUserChosed', function (user) {
      console.log(`[handlers] ${user.name} (ID = ${user.id}) chosed card`);
      let dot = document.querySelector(`#${user.id}`).querySelector('.user .img .dot.dot-red');
      dot.classList.remove('dot-red');
      dot.classList.add('dot-green');
    });

    // выбрана неверная карта
    signalR.connection.on('onWrongCard', function () {
      console.log(`[handlers] Wrong card was chosed`);
    });

    // пользователь не готов
    signalR.connection.on('onUserNotReady', function (id, name) {
      console.log(`[handlers] ${name} (ID = ${id}) is not ready`);
    });

    // пользователь готов
    signalR.connection.on('onUserReady', function (id, name) {
      console.log(`[handlers] ${name} (ID = ${id}) is ready`);
      //TODO: сделать галочку рядом с именем
    });

    // другой пользователь отключился
    signalR.connection.on('onUserDisconnected', function (user, users, roomId) {
      console.log(`[handlers] ${user.name} "(ID = ${user.id}) disconnected from the room with ID = ${roomId}`);
      store.users = users;
      Render.RenderUsers(store.users);
    });

    // другой пользователь подключился
    signalR.connection.on('onUserConnected', function (user, users, roomId) {
      console.log(`[handlers] ${user.name} "(ID = ${user.id}) connected to the room with ID = ${roomId}`);
      store.users = users;
      Render.RenderUsers(store.users);
    });

    // клиент отлючился
    signalR.connection.on('onDisconnected', function () {
      console.log(`[handlers] You were disconnected`);
    });

    // клиент подключился
    signalR.connection.on('onConnected', function (room) {
      console.log(`[handlers] You connected to the room with ID = ${room.id}`);
      store.room = room;
      store.users = room.users;
      Render.RenderUsers(store.users);
    });

    // стартовал раунд
    signalR.connection.on('onRoundStarted', async function (id) {
      console.log(`[handlers] Started Round with ID = ${id}`);
      store.round = await api.requestWithID('round', 'GET', {}, id);
      store.deck = store.round.deck;
      Render.RenderCards(store.deck);
      if (store.timer) {
        store.timer.seconds = 0;
        let roundTimer = setInterval(() => {
          store.timer.seconds += 1;
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
      else {
      store.timer = store.round.roundTime;
      store.timer.seconds = store.timer.minutes * 60;
      store.timer.minutes = 0;
      let roundTimer = setInterval(() => {
          if (store.timer <= 0) {
            clearInterval(roundTimer);
          }
          store.timer.seconds -= 1;
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
    });
  }
  static get instance() {
    if (!this._instance)
      this._instance = new Handlers(singletonMarker);
    return this._instance;
  }
}

function convertTimer(timer) {
  let hours = `${parseInt(timer.seconds/3600)}`.padStart(2, "0");
  let minutes = `${parseInt(timer.seconds/60)}`.padStart(2, "0");
  let seconds = `${timer.seconds % 60}`.padStart(2, "0");
  return [hours, minutes, seconds].join(':');
}


const singletonMarker = {};
export default Handlers;