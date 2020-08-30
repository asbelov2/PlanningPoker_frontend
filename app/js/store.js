import Api from './api';
import Render from './render';
import SignalR from './signalr';

const api = new Api;
const signalR = SignalR.instance;
let roundTimerId;

class Store {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }

  users = [];
  decks = [];
  stories = [];
  userReadiness = [];

  timer;
  user;
  room;
  round;
  deck;
  roundTime;
  title;
  selectedCard;
  roomId = '';
  roundId;
  buildDeck = {
    id: '',
    cards: []
  };

  writeDataToCookie() {
    document.cookie = JSON.stringify({
      roomId: this.roomId,
      userId: this.user.id,
      roundId: (this.round) ? this.round.id : null,
      deckId: (this.user.id === this.room.host.id) ? this.deck.id : null,
      selectedCard: (this.selectedCard) ? this.selectedCard.id : null,
      timerTime: (this.timer) ? this.timer.totalSeconds : null
    });
  }

  async restoreDataFromCookie() {
    if (document.cookie) {
      let cookies = JSON.parse(document.cookie);
      this.roomId = cookies.roomId;
      this.userId = cookies.userId;
      this.roundId = cookies.roundId;
      signalR.connection.invoke('Relogin', this.userId, this.roomId);
      this.user = await api.request('user', 'GET', {}, this.userId);
      this.room = await api.request('room', 'GET', {}, this.roomId);
      this.stories = await api.request('round/RoundResult', 'GET', {
        roomId: this.room.id
      });
      this.users = this.room.users;
      if (this.user.id === this.room.host.id) {
        this.deck = await api.request('deck', 'GET', {}, cookies.deckId);
      }
      this.title = this.room.name;
      if (this.roundId) {
        this.round = await api.request('round', 'GET', {}, this.roundId);
        this.deck = this.round.deck;
        this.roundTime = this.round.roundTime.totalSeconds / 60;
        this.timer = this.round.roundTime;
        this.timer.totalSeconds = cookies.timerTime;
        roundTimerId = setInterval(() => {
          if (this.timer.totalSeconds <= 0) {
            clearInterval(roundTimerId);
          }
          else {
            this.timer.totalSeconds -= 1;
          }
          Render.renderTime(convertTimer(this.timer));
        },
        1 * 1000);
      }
      this.selectedCard = document.getElementById(cookies.selectedCard);
    }
  }

  static get instance() {
    if (!this._instance)
      this._instance = new Store(singletonMarker);
    return this._instance;
  }
}

function convertTimer(timer) {
  let hours = `${parseInt(timer.totalSeconds / 3600)}`.padStart(2, '0');
  let minutes = `${parseInt(timer.totalSeconds / 60)}`.padStart(2, '0');
  let seconds = `${timer.totalSeconds % 60}`.padStart(2, '0');
  return [ hours, minutes, seconds ].join(':');
}

const singletonMarker = {};
export default Store;