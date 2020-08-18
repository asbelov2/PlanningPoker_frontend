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
        document.getElementById('login').style.display = "block";

        document.getElementById("login-button").addEventListener("click", async function (e) {
            store.username = document.getElementById("login-name").value;
            let password = document.getElementById("login-password").value;
            signalR.connection.invoke("Login", store.username);
            document.getElementById("profile-name").innerHTML = store.username;
            store.user = await api.request('user/GetByConnectionId', 'GET', {
                connectionId: signalR.connection.connectionId
            });
            store.room = await api.requestWithID('room', 'GET', {}, store.roomId);
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
        document.getElementById('create-room').style.display = "block";
        store.decks = await api.request('deck', 'GET', {});
        console.log(store.decks);
        for (let i = 0; i < store.decks.length; ++i) {
            let option = document.createElement('oprtion');
            option.innerText = store.decks[i].name;
            console.log(option, document.getElementById('create-room-deck'))
            document.getElementById('create-room-deck').appendChild(option);
        }
        let roomname = '';
        let username = '';
        let password = '';
        let cardInterpretation = '';
        let deckId = '';
        document.getElementById("create-room-button").addEventListener("click", async function (e) {
            roomname = document.getElementById("create-room-name").value;
            document.getElementById('room-name').innerHTML = roomname;
            username = document.getElementById("create-room-username").value;
            document.getElementById("profile-name").innerHTML = username;
            password = document.getElementById("create-room-password").value;
            deckId = document.getElementById("create-room-deck").value;
            console.log(deckId);
            if (deckId === 'DefaultDeck') {
                store.deck = await api.request('deck/GetDefault', 'GET', {});
                console.log(store.deck);
            } else {
                store.deck = await api.requestWithID('deck', 'GET', {}, deckId);
            }
            cardInterpretation = document.getElementById("create-room-cardInterpretation").value;
            console.log(signalR.connection);
            await signalR.connection.invoke("Login", username);
            store.user = await api.request('user/GetByConnectionId', 'GET', {
                connectionId: signalR.connection.connectionId
            });
            await api.request('room', 'POST', {
                hostId: store.user.id,
                name: roomname,
                password: password,
                cardInterpretation: cardInterpretation
            })
            store.room = await api.request(`room/GetByHostId/${store.user.id}`, 'GET', {});
            store.roomId = store.room.id;
            console.log(`[render] ${store.roomId}`);
            document.getElementById("invite-link").addEventListener("click", async function (e) {
                navigator.clipboard.writeText(window.location.origin + `/#roomenter${store.roomId}`);
            });
            router.navigate(`roomlobby`);
        })
    }

    static async RenderRoomPage() {
        console.log('[render] Rendering room page');
        HideByID('login');
        HideByID('create-room');
        HideByID('start-round');
        HideByID('finish-round');
        HideByID('reset-timer');
        document.getElementsByClassName('main')[0].style.display = "flex";
        console.log(`[render] Getting room ${store.roomId}`);
        store.room = await api.requestWithID('room', 'GET', {}, store.roomId);
        console.log(store.room);
        console.log('[render] Getting completed stories');
        store.stories = await api.request('round/RoundResult', 'GET', {
            roomId: store.room.id
        });
        if (store.user.id = store.room.host.id) {
            document.getElementById('start-round').style.display = 'flex';
            document.getElementById('start-round').addEventListener("click", async function (e) {
                await api.requestWithID('room', 'POST', {
                    userId: store.room.host.id,
                    title: 'title',
                    deckId: store.deck.id,
                    roundTimeInMinutes: 5
                }, store.roomId, 'StartRound');
                HideByID('start-round');
                document.getElementById('finish-round').style.display = "flex";
                document.getElementById('finish-round').addEventListener("click", async function (e) {
                    await api.requestWithID('round', 'POST', {
                        userId: store.user.id,
                    }, store.round.id, 'EndRound');
                });
                document.getElementById('reset-timer').style.display = "flex";
                document.getElementById('reset-timer').addEventListener("click", async function (e) {
                    await api.requestWithID('round', 'POST', {
                        userId: store.user.id,
                    }, store.round.id, 'ResetTimer');
                    store.timer = null;
                });
            });
        }
        console.log(store.room);
        console.log(store.room.users);
        document.getElementById('room-name').innerHTML = store.room.name;
        document.getElementById("profile-name").innerHTML = store.user.name;
        Render.RenderStories(store.stories);
        Render.RenderUsers(store.room.users);
        Render.RenderCards(store.deck)
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
            });
            let spans = document.querySelector('#card').content.querySelectorAll('span');
            for (let j = 0; j < spans.length; ++j) {
                spans[j].innerText = deck.cards[i].name;
            }
            card.innerHTML = document.getElementById('card').innerHTML;
            document.getElementsByClassName('cardboard')[0].appendChild(card);
        }
    }

    static RenderStories(stories) {
        document.getElementsByClassName('story-content')[0].innerHTML = '';
        for (let i = 0; i < stories.length; ++i) {
            let storyItem = document.createElement('div');
            document.querySelector('#story').content.querySelector('span').innerText = stories[i].title;
            storyItem.innerHTML = document.getElementById('story').innerHTML;
            document.getElementsByClassName('story-content')[0].appendChild(storyItem);
        }
    }

    static RenderTime(time) {
        document.getElementsByClassName('time')[0].innerText = '⏰' + time;
    }
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

export default Render;