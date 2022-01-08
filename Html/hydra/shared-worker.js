
function log(... message) {
    console.log(... message);
    broadcast('LOG', { message: message.join(' ') });
}

import HydraClient from `./client.js`;

const client = new HydraClient();
client.start().then(() => {
    onconnect = function (event) {
        // console.log(event);

        const port = event.ports[0];
        port.onmessage = client.onMessage.bind(client);
    }

    console.log("Worker Started");
});
