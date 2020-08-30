import Api from './api';
import Store from './store';

const api = new Api;
const store = Store.instance;

class Render {
  constructor(marker) {
    if (marker !== singletonMarker)
      throw new Error('Use instance property');
  }

  static async renderLoginPage() {
    hideByID('main');
    hideByID('create-room');
    hideByID('deck-window');
    hideByID('card-window');
    showByID('login');
  }

  static async renderCreateRoomPage() {
    hideByID('main');
    hideByID('login');
    hideByID('deck-window');
    hideByID('card-window');
    showByID('create-room');
    await Render.loadDecks();
  }

  static async renderRoomPage() {
    hideByID('login');
    hideByID('create-room');
    hideByID('start-round');
    hideByID('finish-round');
    hideByID('reset-timer');
    hideByID('time-set');
    hideByID('remains');
    hideByID('story-name-edit');
    hideByID('deck-window');
    hideByID('card-window');
    hideByID('cardboard');
    hideByID('roundresult-window');
    showByID('infoblock');
    showByID('waiting-round-window');
    showByID('main');
    await store.restoreDataFromCookie();
    document.getElementById('invite-link').addEventListener('click', async() => {
      navigator.clipboard.writeText(window.location.origin + `/#roomenter${store.roomId}`);
    });
    store.user = await api.request('user', 'GET', {}, store.userId);
    store.room = await api.request('room', 'GET', {}, store.roomId);
    if (store.room.id) {
      store.stories = await api.request('round/RoundResult', 'GET', {
        roomId: store.room.id
      });

      if (store.user.id === store.room.host.id) {
        showByID('time-set');
        showByID('start-round');
        showByID('story-name-edit');
        hideByID('story-header');
      }

      document.getElementById('room-name').innerHTML = store.room.name;
      document.getElementById('profile-name').innerHTML = store.user.name;
      Render.renderStories(store.stories);
      Render.renderUsers(store.room.users);
    }
  }

  
  static async renderRound(id) {
    store.roundId = id;
    setRoomStatus('Waiting for players to vote');
    hideByID('infoblock');
    showByID('cardboard');
    showByID('remains');
    if (store.user.id === store.room.host.id) {
      hideByID('start-round');
      hideByID('time-set');
      hideByID('story-name-edit');
      showByID('story-header');
      showByID('finish-round');
      showByID('reset-timer');
    }
    store.round = await api.request('round', 'GET', {}, id);
    document.getElementById('story-header').innerText = store.round.title;
    store.deck = store.round.deck;
    Render.renderCards(store.deck);
    store.timer = store.round.roundTime;
    if (store.timer.totalSeconds === 0) {
      store.timer = {
        totalSeconds: 0
      };
      this.roundTimerId = setInterval(() => {
        store.timer.totalSeconds += 1;
        Render.renderTime(convertTimer(store.timer));
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
        Render.renderTime(convertTimer(store.timer));
      },
      1 * 1000);
    }
    store.stories = await api.request('round/RoundResult', 'GET', {
      roomId: store.room.id
    });
    Render.renderStories(store.stories);
  }

  static async renderDeckCreatePage() {
    hideByID('main');
    hideByID('login');
    hideByID('create-room');
    hideByID('card-window');
    showByID('deck-window');
    document.getElementsByClassName('deck-cardboard')[0].innerHTML = '';
    for (let i = 0; i < store.buildDeck.cards.length; ++i) {
      let card = document.createElement('div');
      let spans = document.querySelector('#card').content.querySelectorAll('span');
      for (let j = 0; j < spans.length; ++j) {
        spans[j].innerText = store.buildDeck.cards[i].name;
      }
      card.innerHTML = document.getElementById('card').innerHTML;
      card.classList.add('deck-card');
      card.id = store.buildDeck.cards[i].name;
      let del = document.createElement('div');
      del.appendChild(document.createElement('span'));
      del.querySelector('span').innerText = 'X';
      del.classList.add('deck-card-delete');
      del.addEventListener('click', async() => {
        store.buildDeck.cards.splice(i, 1);
        await Render.renderDeckCreatePage();
      });
      card.appendChild(del);
      document.getElementsByClassName('deck-cardboard')[0].appendChild(card);

    }

    let card = document.createElement('div');
    let spans = document.querySelector('#card').content.querySelectorAll('span');
    for (let j = 0; j < spans.length; ++j) {
      spans[j].innerText = '+';
    }
    card.innerHTML = document.getElementById('card').innerHTML;
    card.querySelector('.card').id = 'deck-add-card';
    card.addEventListener('click', async() => {
      await Render.renderCardAddingPage();
    });
    document.getElementsByClassName('deck-cardboard')[0].appendChild(card);

  }

  static async renderCardAddingPage() {
    hideByID('deck-window');
    showByID('card-window');
  }

  static renderUsers(users) {
    document.getElementsByClassName('users')[0].innerHTML = '';
    for (let i = 0; i < users.length; ++i) {
      let userItem = document.createElement('div');
      userItem.id = users[i].id;
      document.querySelector('#user').content.querySelector('span').innerText = users[i].name;
      userItem.innerHTML = document.getElementById('user').innerHTML;
      document.getElementsByClassName('users')[0].appendChild(userItem);
    }
  }

  static renderCards(deck) {
    document.getElementsByClassName('cardboard')[0].innerHTML = '';
    for (let i = 0; i < deck.cards.length; ++i) {
      let card = document.createElement('div');
      card.addEventListener('click', async() => {
        await api.request('round', 'PUT', {
          userId: store.user.id,
          cardName: deck.cards[i].name
        }, store.round.id, 'ChooseCard');
        if (store.selectedCard) {
          store.selectedCard.className = 'card';
        }
        store.selectedCard = card.querySelector('.card');
        store.selectedCard.classList.add('card-clicked');
      });
      let spans = document.querySelector('#card').content.querySelectorAll('span');
      for (let j = 0; j < spans.length; ++j) {
        spans[j].innerText = deck.cards[i].name;
      }
      card.innerHTML = document.getElementById('card').innerHTML;
      card.querySelector('.card').id = deck.cards[i].name;
      document.getElementsByClassName('cardboard')[0].appendChild(card);
    }
  }

  static renderStories(stories) {
    document.getElementsByClassName('story-content')[0].innerHTML = '';
    for (let i = 0; i < stories.length; ++i) {
      let storyItem = document.createElement('div');
      document.querySelector('#story').content.querySelector('span').innerText = stories[i].title;
      storyItem.innerHTML = document.getElementById('story').innerHTML;
      if (stories[i].id === store.round?.id) {
        storyItem.querySelector('.story-element').classList.add('story-element-active');
      }
      document.getElementsByClassName('story-content')[0].appendChild(storyItem);
    }
  }

  static renderResult(round) {
    document.getElementsByClassName('roundresult-choices')[0].innerHTML = '';
    document.getElementsByClassName('roundresult-average-score')[0].innerText = round.result;
    for (let i = 0; i < round.choices.length; ++i) {
      let choiceItem = document.createElement('div');
      document.querySelector('#choice').content.querySelector('.roundresult-name span').innerText = round.choices[i].user.name;
      document.querySelector('#choice').content.querySelector('.roundresult-value span').innerText = round.choices[i].card.value;
      document.querySelector('#choice').content.querySelector('.mini-card').innerText = round.choices[i].card.name;
      choiceItem.innerHTML = document.getElementById('choice').innerHTML;
      document.getElementsByClassName('roundresult-choices')[0].appendChild(choiceItem);
    }
  }

  static renderTime(time) {
    document.getElementsByClassName('time-value')[0].innerText = '⏰' + time;
  }

  static async loadDecks() {
    document.getElementById('create-room-deck').innerHTML = '';
    store.decks = await api.request('deck', 'GET', {});
    if (store.decks.length === 0) {
      let option = document.createElement('option');
      option.innerText = 'DefaultDeck';
      document.getElementById('create-room-deck').appendChild(option);
    }
    else {
      for (let i = 0; i < store.decks.length; ++i) {
        let option = document.createElement('option');
        option.innerText = store.decks[i].name;
        option.value = store.decks[i].id;
        document.getElementById('create-room-deck').appendChild(option);
      }
    }
  }

  static get instance() {
    if (!this._instance)
      this._instance = new Render(singletonMarker);
    return this._instance;
  }
}

function convertTimer(timer) {
  let hours = `${parseInt(timer.totalSeconds / 3600)}`.padStart(2, '0');
  let minutes = `${parseInt(timer.totalSeconds / 60)}`.padStart(2, '0');
  let seconds = `${timer.totalSeconds % 60}`.padStart(2, '0');
  return [ hours, minutes, seconds ].join(':');
}

function setRoomStatus(status) {
  document.getElementById('room-panel-status').innerText = status;
}

function showByID(element_id) {
  if (document.getElementById(element_id)) {
    document.getElementById(element_id).style.display = 'flex';
  }
  else {
    alert('Элемент с id: ' + element_id + ' не найден!');
  }
}

function hideByID(element_id) {
  if (document.getElementById(element_id)) {
    document.getElementById(element_id).style.display = 'none';
  }
  else {
    alert('Элемент с id: ' + element_id + ' не найден!');
  }
}

const singletonMarker = {};
export default Render;