class Render {
    connection;

    constructor(hubConnection) {
        this.connection = hubConnection;
    }

    RenderLoginPage() {
        HideByClass('main');
        HideByID('create-room');
        document.getElementById('login').style.display = "block";
    }

    async RenderCreateRoomPage() {
        HideByClass('main');
        HideByID('login');
        document.getElementById('create-room').style.display = "block";
        console.log('welcome in room-create page');
        render.RenderCreateRoomPage();
        let roomname = '';
        let username = '';
        let deck = '';
        document.getElementById("create-room-button").addEventListener("click", async function (e) {
            console.log('123');
            document.getElementById("profile-name").innerHTML = username;
            roomname = document.getElementById("create-room-name").value;
            username = document.getElementById("create-room-username").value;
            await connection.invoke("Login", username);
            let user;
            await fetch(`https://localhost:44356/api/user/GetByConnectionId?connectionId=${connectionId}`, {
                    method: 'GET',
                })
                .then(async response => {
                    if (response.status !== 200)
                        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
                    console.log(response);
                    return await response.json();
                })
                .then(data => {
                    user = data;
                })
                .catch(err => {
                    throw (err);
                });

            console.log(user);

            fetch(`https://localhost:44356/api/room?hostId=${user.id}&name=${roomname}&password=&cardInterpretation=days`, {
                    method: 'POST',
                })
                .then(response => {
                    if (response.status !== 200) {
                        console.log(`Looks like there was a problem. Status Code: ${response.status}`);
                        return;
                    }
                })
                .catch(err => {
                    throw (err);
                });
        })
    }

    async RenderRoomPage() {
        HideByID('login');
        HideByID('create-room');
        document.getElementsByClassName('main')[0].style.display = "flex";
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