import * as SignalR from '@microsoft/signalr';

class SignalR {
    connection;
    connectionId;

    constructor() {
        if (!this.connection) {
            connection = new SignalR.HubConnectionBuilder()
                .withUrl("https://localhost:44356/roomhub", {
                    skipNegotiation: false,
                    transport: SignalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .build();
            await connection.start().then(() => {
                connectionId = connection.connectionId;
            })
        }
        return this.connection;
    }
}

export default SignalR;