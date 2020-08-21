import SignalR from './signalr';
import Api from './api';
import Store from './store';
import Router from './router';

const signalR = SignalR.instance;
const api = new Api;
const store = Store.instance;
const router = Router.instance;

class Render {
    constructor(marker) {
        if (marker !== singletonMarker)
            throw new Error('Use instance property');
    }

    static async RenderLoginPage() {
        HideByClass('main');
        HideByID('create-room');
        HideByID('deck-window');
        HideByID('card-window');
        ShowByID('login');
    }

    static async RenderCreateRoomPage() {
        HideByClass('main');
        HideByID('login');
        HideByID('deck-window');
        HideByID('card-window');
        ShowByID('create-room');
        await Render.LoadDecks();
    }

    static async RenderRoomPage() {
        HideByID('login');
        HideByID('create-room');
        HideByID('start-round');
        HideByID('finish-round');
        HideByID('reset-timer');
        HideByID('time-set');
        HideByID('remains');
        HideByID('story-name-edit');
        HideByID('deck-window');
        HideByID('card-window');
        HideByID('cardboard');
        HideByID('roundresult-window');
        ShowByID('infoblock');
        ShowByID('waiting-round-window');
        ShowByID('main');
        store.room = await api.requestWithID('room', 'GET', {}, store.roomId);
        if (store.room.id) {
            store.stories = await api.request('round/RoundResult', 'GET', {
                roomId: store.room.id
            });

            if (store.user.id === store.room.host.id) {
                ShowByID('time-set');
                ShowByID('start-round');
                ShowByID('story-name-edit');
                HideByID('story-header');
            }
            document.getElementById('room-name').innerHTML = store.room.name;
            document.getElementById("profile-name").innerHTML = store.user.name;
            Render.RenderStories(store.stories);
            Render.RenderUsers(store.room.users);
        }
    }

    static async RenderDeckCreatePage() {
        HideByClass('main');
        HideByID('login');
        HideByID('create-room');
        HideByID('card-window');
        ShowByID('deck-window');
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
            del.appendChild(document.createElement('span'))
            del.querySelector('span').innerText = 'X';
            del.classList.add('deck-card-delete');
            del.addEventListener("click", async function (e) {
                store.buildDeck.cards.splice(i, 1);
                await Render.RenderDeckCreatePage()
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
        card.addEventListener("click", async function (e) {
            await Render.RenderCardAddingPage();
        });
        document.getElementsByClassName('deck-cardboard')[0].appendChild(card);

    }

    static async RenderCardAddingPage() {
        HideByID('deck-window');
        ShowByID('card-window');
    }

    static RenderUsers(users) {
        document.getElementsByClassName('users')[0].innerHTML = '';
        for (let i = 0; i < users.length; ++i) {
            let userItem = document.createElement('div');
            userItem.id = users[i].id;
            document.querySelector('#user').content.querySelector('span').innerText = users[i].name;
            userItem.innerHTML = document.getElementById('user').innerHTML;
            document.getElementsByClassName('users')[0].appendChild(userItem);
        }
    }

    static RenderCards(deck) {
        document.getElementsByClassName('cardboard')[0].innerHTML = '';
        for (let i = 0; i < deck.cards.length; ++i) {
            let card = document.createElement('div');
            card.addEventListener("click", async function (e) {
                await api.requestWithID('round', 'PUT', {
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

    static RenderStories(stories) {
        document.getElementsByClassName('story-content')[0].innerHTML = '';
        for (let i = 0; i < stories.length; ++i) {
            let storyItem = document.createElement('div');
            document.querySelector('#story').content.querySelector('span').innerText = stories[i].title;
            storyItem.innerHTML = document.getElementById('story').innerHTML;
            if (stories[i].id === store.round.id) {
                storyItem.querySelector('.story-element').classList.add('story-element-active');
            }
            document.getElementsByClassName('story-content')[0].appendChild(storyItem);
        }
    }

    static RenderResult(round) {
        document.getElementsByClassName('roundresult-choices')[0].innerHTML = '';
        document.getElementsByClassName('roundresult-average-score')[0].innerText = round.result;
        console.log(round.choices);
        for (let i = 0; i < round.choices.length; ++i) {
            let choiceItem = document.createElement('div');
            document.querySelector('#choice').content.querySelector('.roundresult-name span').innerText = round.choices[i].user.name;
            document.querySelector('#choice').content.querySelector('.roundresult-value span').innerText = round.choices[i].card.value;
            document.querySelector('#choice').content.querySelector('.mini-card').innerText = round.choices[i].card.name;
            choiceItem.innerHTML = document.getElementById('choice').innerHTML;
            document.getElementsByClassName('roundresult-choices')[0].appendChild(choiceItem);
        }
    }

    static RenderTime(time) {
        document.getElementsByClassName('time-value')[0].innerText = '⏰' + time;
    }

    static async LoadDecks() {
        document.getElementById('create-room-deck').innerHTML = '';
        store.decks = await api.request('deck', 'GET', {});
        if (store.decks.length === 0) {
            let option = document.createElement('option');
            option.innerText = 'DefaultDeck';
            document.getElementById('create-room-deck').appendChild(option);
        } else {
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

function strToSeconds(str) {
    let myTimeArr = str.split(":");
    return parseInt(parseInt(myTimeArr[0]) * 60 + parseInt(myTimeArr[1]));
}

function ShowByID(element_id) {
    if (document.getElementById(element_id)) {
        document.getElementById(element_id).style.display = 'flex';
    } else alert("Элемент с id: " + element_id + " не найден!");
}

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

function ReadRoomInfo() {
    let roominfo = {
        roomname: '',
        username: '',
        password: '',
        cardInterpretation: '',
        deckId: ''
    };
    roominfo.roomname = document.getElementById("create-room-name").value;
    roominfo.username = document.getElementById("create-room-username").value;
    roominfo.password = document.getElementById("create-room-password").value;
    roominfo.deckId = document.getElementById("create-room-deck").value;
    roominfo.cardInterpretation = document.getElementById("create-room-cardInterpretation").value;
    return roominfo;
}

const singletonMarker = {};
export default Render;