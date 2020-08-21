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

  static get instance() {
    if (!this._instance)
      this._instance = new Store(singletonMarker);
    return this._instance;
  }
}

const singletonMarker = {};
export default Store;