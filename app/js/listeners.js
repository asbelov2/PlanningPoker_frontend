import SignalR from './signalr';
import Api from './api';
import Store from './store';
import Router from './router';
import Render from './render';

const signalR = SignalR.instance;
const api = new Api;
const store = Store.instance;
const router = Router.instance;

class Listeners {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }

  static initAllListeners() {
    window.onload = () => {
      document.getElementById('login-button').addEventListener('click', async() => {
        store.room = await api.request('room', 'GET', {}, store.roomId);
        store.username = document.getElementById('login-name').value;
        for (let i = 0; i < store.room.users.length; ++i) {
          if (store.room.users[i].name === store.username) {
            alert(`Name '${store.username}' is reserved`);
            return;
          }
        }
        let password = document.getElementById('login-password').value;
        signalR.connection.invoke('Login', store.username);
        document.getElementById('profile-name').innerHTML = store.username;
        store.user = await api.request('user/GetByConnectionId', 'GET', {
          connectionId: signalR.connection.connectionId
        });
        store.writeDataToCookie();
        await api.request('room', 'POST', {
          userId: store.user.id,
          password: password
        }, store.roomId, 'connect');
        router.navigate('roomlobby');
      });

      document.getElementById('create-deck-button').addEventListener('click', async() => {
        router.navigate('roomdeckcreate');
      });

      document.getElementById('create-room-button').addEventListener('click', async() => {
        let roominfo = ReadRoomInfo();
        document.getElementById('room-name').innerText = roominfo.roomname;
        document.getElementById('profile-name').innerText = roominfo.username;
        if (roominfo.deckId === 'DefaultDeck') {
          store.deck = await api.request('deck/GetDefault', 'GET', {});
        } 
        else {
          store.deck = await api.request('deck', 'GET', {}, roominfo.deckId);
        }
        await signalR.connection.invoke('Login', roominfo.username);
        store.user = await api.request('user/GetByConnectionId', 'GET', {
          connectionId: signalR.connection.connectionId
        });
        await api.request('room', 'POST', {
          hostId: store.user.id,
          name: roominfo.roomname,
          password: roominfo.password,
          cardInterpretation: roominfo.cardInterpretation
        });
        store.room = await api.request(`room/GetByHostId/${store.user.id}`, 'GET', {});
        store.roomId = store.room.id;
        store.writeDataToCookie();
        router.navigate('roomlobby');
      });

      document.getElementById('start-round').addEventListener('click', async() => {
        let seconds = strToSeconds(document.getElementById('time-edit').value);
        store.roundTime = seconds / 60;
        store.title = document.getElementById('story-name-edit').value;
        await api.request('room', 'POST', {
          userId: store.room.host.id,
          title: store.title,
          deckId: store.deck.id,
          roundTimeInMinutes: store.roundTime
        }, store.roomId, 'StartRound');
        store.writeDataToCookie();
      });

      document.getElementById('finish-round').addEventListener('click', async() => {
        await api.request('round', 'POST', {
          userId: store.user.id,
        }, store.round.id, 'EndRound');
        store.round = null;
        store.writeDataToCookie();
      });

      document.getElementById('reset-timer').addEventListener('click', async() => {
        await api.request('round', 'POST', {
          userId: store.user.id,
        }, store.round.id, 'ResetTimer');
        store.timer = null;
      });

      document.getElementById('deck-create-button').addEventListener('click', async() => {
        store.buildDeck.id = await api.request('deck', 'POST', {
          name: document.getElementById('deck-name').value
        });
        for (let i = 0; i < store.buildDeck.cards.length; ++i) {
          if (store.buildDeck.cards[i].type === 'valuable') {
            await api.request('deck', 'POST', {
              value: store.buildDeck.cards[i].value
            }, store.buildDeck.id, 'AddValuableCard');
          } 
          else {
            await api.request('deck', 'POST', {
              name: store.buildDeck.cards[i].name
            }, store.buildDeck.id, 'AddExceptionalCard');
          }
        }

        router.navigate('roomcreate');
      });

      document.getElementById('card-window-button').addEventListener('click', async() => {
        let card;
        if (document.getElementById('card-window-type').checked === true) {
          card = {
            type: 'valuable',
            value: document.getElementById('card-window-value').value,
            name: document.getElementById('card-window-value').value
          };
        } 
        else {
          card = {
            type: 'exceptional',
            name: document.getElementById('card-window-name').value,
            value: 0
          };
        }

        for (let i = 0; i < store.buildDeck.cards.length; ++i) {
          if (store.buildDeck.cards[i].name === card.name) {
            alert('Card names must not match');
            return;
          }
        }

        store.buildDeck.cards.push(card);
        await Render.RenderDeckCreatePage();
      });
    };
  }

  static get instance() {
    if (!this._instance)
      this._instance = new Listeners(singletonMarker);
    return this._instance;
  }
}

function strToSeconds(str) {
  let myTimeArr = str.split(':');
  return parseInt(parseInt(myTimeArr[0]) * 3600 + parseInt(myTimeArr[1]) * 60 + parseInt(myTimeArr[2]));
}

function ReadRoomInfo() {
  let roominfo = {
    roomname: '',
    username: '',
    password: '',
    cardInterpretation: '',
    deckId: ''
  };
  roominfo.roomname = document.getElementById('create-room-name').value;
  roominfo.username = document.getElementById('create-room-username').value;
  roominfo.password = document.getElementById('create-room-password').value;
  roominfo.deckId = document.getElementById('create-room-deck').value;
  roominfo.cardInterpretation = document.getElementById('create-room-cardInterpretation').value;
  return roominfo;
}

const singletonMarker = {};
export default Listeners;