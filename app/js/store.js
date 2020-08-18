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
  roomId = '';

  addUser(user) {
    this.users.push(user);
  }

  isUserReadyToEnterRoom() {

    if (this.user){}
    else{
      console.log(`[store] User not ready to enter in room (user=${this.user})`);
      return false;
    }
    return true;
  }

  static get instance() {
    if (!this._instance)
      this._instance = new Store(singletonMarker);
    return this._instance;
  }
}

const singletonMarker = {};
export default Store;