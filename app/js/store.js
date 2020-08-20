class Store {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }
  users = [];
  decks = [];
  stories = [];

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

  static get instance() {
    if (!this._instance)
      this._instance = new Store(singletonMarker);
    return this._instance;
  }
}

const singletonMarker = {};
export default Store;