function log(... message) {
    console.log(... message);
    broadcast('LOG', { message: message.join(' ') });
}

import HydraClient from `./client.js`;

const client = new HydraClient();
const port = {
    postMessage: self.postMessage.bind(self)
};

client.start().then(() => {
    self.addEventListener('onmessage', client.onMessage.bind(client, port));
    console.log("Worker Started");
});
