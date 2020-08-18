import * as signalR from '@microsoft/signalr';

class SignalR {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:44356/roomhub", {
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();

    constructor(marker) {
        if (marker !== singletonMarker)
            throw new Error('Use instance property');
        this.connection.start();

        return this;
    }
    static get instance() {
        if (!this._instance)
            this._instance = new SignalR(singletonMarker);
        return this._instance;
    }
}
const singletonMarker = {};
export default SignalR;