import SignalR from './signalr';
import Api from './api';
import Store from './store';
import Router from './router';

const signalR = SignalR.instance;
const api = new Api;
const store = Store.instance;
const router = Router.instance;

class Render {
    async RenderLoginPage() {
        HideByClass('main');
        HideByID('create-room');
        ShowByID('login');
        document.getElementById("login-button").addEventListener("click", async function (e) {
            store.room = await api.requestWithID('room', 'GET', {}, store.roomId);
            store.username = document.getElementById("login-name").value;
            for (let i = 0; i < store.room.users.length; ++i) {
                if (store.room.users[i].name === store.username) {
                    alert(`Имя ${store.username} уже занято`);
                    return;
                }
            }
            let password = document.getElementById("login-password").value;
            signalR.connection.invoke("Login", store.username);
            document.getElementById("profile-name").innerHTML = store.username;
            store.user = await api.request('user/GetByConnectionId', 'GET', {
                connectionId: signalR.connection.connectionId
            });
            await api.requestWithID('room', 'POST', {
                userId: store.user.id,
                password: password
            }, store.roomId, 'connect');
            router.navigate('roomlobby');
        });
    }

    async RenderCreateRoomPage() {
        HideByClass('main');
        HideByID('login');
        ShowByID('create-room');
        Render.LoadDecks();
        document.getElementById("create-room-button").addEventListener("click", async function (e) {
            let roominfo = ReadRoomInfo();
            document.getElementById('room-name').innerText = roominfo.roomname;
            document.getElementById("profile-name").innerText = roominfo.username;
            if (roominfo.deckId === 'DefaultDeck') {
                store.deck = await api.request('deck/GetDefault', 'GET', {});
            } else {
                store.deck = await api.requestWithID('deck', 'GET', {}, roominfo.deckId);
            }
            await signalR.connection.invoke("Login", roominfo.username);
            store.user = await api.request('user/GetByConnectionId', 'GET', {
                connectionId: signalR.connection.connectionId
            });
            await api.request('room', 'POST', {
                hostId: store.user.id,
                name: roominfo.roomname,
                password: roominfo.password,
                cardInterpretation: roominfo.cardInterpretation
            })
            store.room = await api.request(`room/GetByHostId/${store.user.id}`, 'GET', {});
            store.roomId = store.room.id;
            document.getElementById("invite-link").addEventListener("click", async function (e) {
                navigator.clipboard.writeText(window.location.origin + `/#roomenter${store.roomId}`);
            });
            router.navigate(`roomlobby`);
        })
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
                document.getElementById('start-round').addEventListener("click", async function (e) {
                    let seconds = strToSeconds(document.getElementById('time-edit').value)
                    store.roundTime = seconds / 60;
                    store.title = document.getElementById('story-name-edit').value;
                    await api.requestWithID('room', 'POST', {
                        userId: store.room.host.id,
                        title: store.title,
                        deckId: store.deck.id,
                        roundTimeInMinutes: store.roundTime
                    }, store.roomId, 'StartRound');
                    document.getElementById('finish-round').addEventListener("click", async function (e) {
                        await api.requestWithID('round', 'POST', {
                            userId: store.user.id,
                        }, store.round.id, 'EndRound');
                    });
                    document.getElementById('reset-timer').addEventListener("click", async function (e) {
                        await api.requestWithID('round', 'POST', {
                            userId: store.user.id,
                        }, store.round.id, 'ResetTimer');
                        store.timer = null;
                    });
                });
            }
            document.getElementById('room-name').innerHTML = store.room.name;
            document.getElementById("profile-name").innerHTML = store.user.name;
            Render.RenderStories(store.stories);
            Render.RenderUsers(store.room.users);
        }
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
        for (let i = 0; i < store.deck.cards.length; ++i) {
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

export default Render;