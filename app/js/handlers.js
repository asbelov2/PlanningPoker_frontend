import SignalR from './signalr';
import Render from './render';
import Store from './store';
import Api from './api';

const signalR = SignalR.instance;
const store = Store.instance;
const api = new Api();

class Handlers {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }

  roundTimerId;

  static async initHandlers() {
    signalR.connection.on('onLogin', () => {});

    signalR.connection.on('onEnd', async() => {
      HideByID('roundresult-window');
      HideByID('remains');
      HideByID('finish-round');
      ShowByID('waiting-round-window');
      if (store.user.id === store.room.host.id) {
        ShowByID('time-set');
        ShowByID('start-round');
        ShowByID('story-name-edit');
        HideByID('story-header');
        HideByID('reset-timer');
      }
      store.stories = await api.request('round/RoundResult', 'GET', {
        roomId: store.room.id
      });
      clearInterval(this.roundTimerId);
      Render.RenderUsers(store.users);
      Render.RenderStories(store.stories);
    });

    signalR.connection.on('onResetTimer', async() => {
      clearInterval(this.roundTimerId);
      store.round = await api.requestWithID('round', 'GET', {}, store.roundId);
      store.timer = store.round.roundTime;
      if (store.timer.totalSeconds === 0) {
        store.timer = {
          totalSeconds: 0
        };
        this.roundTimerId = setInterval(() => {
          store.timer.totalSeconds += 1;
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
      else {
        this.roundTimerId = setInterval(() => {
          if (store.timer.totalSeconds <= 0) {
            clearInterval(this.roundTimerId);
          }
          else {
            store.timer.totalSeconds -= 1;
          }
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
    });

    signalR.connection.on('onRoundChanged', (round) => {
      store.round = round;
    });

    signalR.connection.on('onTimeOver', async() => {
      document.getElementById('room-panel-status').innerText = 'Time is up!';
      clearInterval(this.roundTimerId);
    });

    signalR.connection.on('onAllChosed', async(round) => {
      HideByID('cardboard');
      HideByID('waiting-round-window');
      ShowByID('roundresult-window');
      ShowByID('infoblock');
      Render.RenderResult(round);
      store.stories = await api.request('round/RoundResult', 'GET', {
        roomId: store.room.id
      });
      Render.RenderStories(store.stories);
      setRoomStatus('Round is over');
      clearInterval(this.roundTimerId);
    });

    signalR.connection.on('onUserChosed', (user) => {
      let dot = document.querySelector(`#${user.id}`).querySelector('.user .img .dot.dot-red');
      dot.classList.remove('dot-red');
      dot.classList.add('dot-green');
    });

    signalR.connection.on('onWrongCard', () => {});

    signalR.connection.on('onUserNotReady', (id, name) => {
      let user = {
        id: id,
        name: name
      };
      for (let i = 0; i < store.userReadiness.length; ++i) {
        if (store.userReadiness[i].user === user) {
          store.userReadiness[i].isReady = false;
        }
      }
    });

    signalR.connection.on('onUserReady', (id, name) => {
      store.userReadiness.push({
        user: {
          id: id,
          name: name
        },
        isReady: true
      });
    });

    signalR.connection.on('onUserDisconnected', (user, users) => {
      store.users = users;
      Render.RenderUsers(store.users);
    });

    signalR.connection.on('onUserConnected', (user, users) => {
      store.users = users;
      Render.RenderUsers(store.users);
    });

    signalR.connection.on('onDisconnected', () => {
    });

    signalR.connection.on('onConnected', (room) => {
      store.room = room;
      store.users = room.users;
      Render.RenderUsers(store.users);
    });

    signalR.connection.on('onRoundStarted', async(id) => {
      store.roundId = id;
      setRoomStatus('Waiting for players to vote');
      HideByID('infoblock');
      ShowByID('cardboard');
      ShowByID('remains');
      if (store.user.id === store.room.host.id) {
        HideByID('start-round');
        HideByID('time-set');
        HideByID('story-name-edit');
        ShowByID('story-header');
        ShowByID('finish-round');
        ShowByID('reset-timer');
      }
      store.round = await api.requestWithID('round', 'GET', {}, id);
      document.getElementById('story-header').innerText = store.round.title;
      store.deck = store.round.deck;
      Render.RenderCards(store.deck);
      store.timer = store.round.roundTime;
      if (store.timer.totalSeconds === 0) {
        store.timer = {
          totalSeconds: 0
        };
        this.roundTimerId = setInterval(() => {
          store.timer.totalSeconds += 1;
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
      else {
        this.roundTimerId = setInterval(() => {
          if (store.timer.totalSeconds <= 0) {
            clearInterval(this.roundTimerId);
          }
          else {
            store.timer.totalSeconds -= 1;
          }
          Render.RenderTime(convertTimer(store.timer));
        },
        1 * 1000);
      }
      store.stories = await api.request('round/RoundResult', 'GET', {
        roomId: store.room.id
      });
      Render.RenderStories(store.stories);
    });
  }
  static get instance() {
    if (!this._instance)
      this._instance = new Handlers(singletonMarker);
    return this._instance;
  }
}

function setRoomStatus(status) {
  document.getElementById('room-panel-status').innerText = status;
}

function convertTimer(timer) {
  let hours = `${parseInt(timer.totalSeconds / 3600)}`.padStart(2, '0');
  let minutes = `${parseInt(timer.totalSeconds / 60)}`.padStart(2, '0');
  let seconds = `${timer.totalSeconds % 60}`.padStart(2, '0');
  return [ hours, minutes, seconds ].join(':');
}

function ShowByID(element_id) {
  if (document.getElementById(element_id)) {
    document.getElementById(element_id).style.display = 'flex';
  }
  else alert('Элемент с id: ' + element_id + ' не найден!');
}

function HideByID(element_id) {
  if (document.getElementById(element_id)) {
    document.getElementById(element_id).style.display = 'none';
  }
  else alert('Элемент с id: ' + element_id + ' не найден!');
}

const singletonMarker = {};
export default Handlers;