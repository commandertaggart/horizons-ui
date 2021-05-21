
const PROTOCOL_VERSION = '25';

const clients = new Map();
const subscriptions = {};
const desiredMessages = new Set();

const forcedMessageCache = {
    VESSEL: null,
    FACTIONS: null,
    ALERT: null
};

function union(setA, setB) {
    setA = new Set(setA || []);
    setB = (setB && setB[Symbol.iterator]) ? setB : [];
    for (const x of setB) {
        setA.add(x);
    }
    return setA;
}

function broadcast(eventType, data) {
    for (const [port, _client] of clients) {
        sendTo(port, eventType, data);
    };
}

function sendTo(port, eventType, data) {
    port.postMessage({
        eventType,
        ... data
    });
}

function log(... message) {
    console.log(... message);
    broadcast('LOG', { message: message.join(' ') });
}

onconnect = function (event) {
    // console.log(event);

    const port = event.ports[0];

    port.onmessage = function (event) {
        
        function unsubscribe(msgType) {
            if (subscriptions[msgType]) {
                subscriptions[msgType].delete(port);
                if (subscriptions[msgType].size === 0) {
                    desiredMessages.delete(msgType);
                    // 'UNACCEPT-PACKET' ??
                }
            }
        }

        if (event && event.data && event.data.eventType) {
            switch (event.data.eventType) {
                case 'START': {
                    //let protocol = protocols[event.data.protocolVersion] || protocols[event.data.protocolVersion.split('.')[0]];

                    if (protocol && !clients.has(port)) {
                        clients.set(port, {
                            port,
                            protocol
                        });
                    }
                }
                break;
                case 'STOP': {
                    clients.delete(port);
                    for (const msgType in subscriptions) {
                        unsubscribe(msgType);
                    }
                    if (clients.size === 0) {
                        CloseSocket();
                    }
                }
                break;
                case 'SUBSCRIBE': {
                    const subs = subscriptions[event.data.messageType] = subscriptions[event.data.messageType] || new Set();
                    subs.add(port);

                    if (!desiredMessages.has(event.data.messageType)) {
                        desiredMessages.add(event.data.messageType);
                        if (socketstatus === 1) {
                            protocol.send('ACCEPT-PACKET', event.data.messageType);
                        }
                    }

                    if (event.data.messageType in forcedMessageCache && forcedMessageCache[event.data.messageType]) {
                        sendTo(port, 'RECEIVE', forcedMessageCache[event.data.messageType]);
                    }
                }
                break;
                case 'UNSUBSCRIBE': {
                    unsubscribe(event.data.messageType);
                }
                break;
                case 'SEND': {
                    if (clients[port] && event.data.messageType && event.data.messagePayload) {
                        clients[port].protocol.send(event.data);
                    }
                }
            }
        }
    }

    UpdateSocketStatus(port);
}

console.log("Worker Started");

// TODO: break these out into separate files and load the right one with importScripts()
const protocols = {
    '25': {
        port: 1865,
        encode(message) {
            let payload = message.messagePayload;
            if (typeof(payload) === 'object') {
                payload = JSON.stringify(payload);
            }
            else if (typeof(payload) === 'undefined') {
                payload = '';
            }
            return message.messageType + '|' + message.messagePayload;
        },
        decode(message) {
            message = message.split('|');
            
            try {
                message[1] = JSON.parse(message[1]);
            } catch (_ex) {}

            return {
                messageType: message[0],
                messagePayload: message[1]
            }
        },
        send(messageType, messagePayload) {
            let message = { messageType, messagePayload };
            if (typeof(messageType) === 'object' && 'messageType' in messageType) {
                message = messageType;
            }

            if (socket) {
                socket.send(this.encode(message));
            }
        }
    }
};
const protocol = protocols[PROTOCOL_VERSION];

let socket = null;
let socketstatus = 0;   //0=Closed, 1=Open
let socketRetry;
function SetSocket() {
    var thishost = location.hostname;

    try {
        if (socket) 
            CloseSocket();
    } catch (err) {
        console.log("SetSocket.CloseSocket: " + err.message);
    }

    try {
        socket = new WebSocket('ws://' + thishost + ':' + protocol.port + '/');
        socket.onopen = function (event) {
            try {
                SetPING();
                clearInterval(socketRetry);
                socketRetry = null;
                socketstatus = 1;
                UpdateSocketStatus();
                desiredMessages.forEach((messageType) => {
                    if (messageType !== '*') {
                        protocol.send('ACCEPT-PACKET', messageType);
                    }
                });
                protocol.send('IDENTIFY', Json.stringify({
                    ScreenName: 'Shared',
                    Location: ''
                }));
            } catch (err) {
                console.log("Socket.OnOpen: " + err.message);
            }
        };
        socket.onclose = function (event) {
            ClearPING();
            ResetSocket();
        };
        socket.onerror = function (event) {
            CloseSocket();
        };
        socket.onmessage = function (event) {
            // console.log(event);
            try {
                HandleMessage(event.data);
            } catch (err) {
                console.log("Socket.OnMessge: " + err.message);
            }
            
        };
    } catch (err) {
        console.log("SetSocket: " + err.message);
        socketstatus = 0;
    }

}
function ResetSocket() {
    try {
        CloseSocket();
        UpdateSocketStatus();
        SocketReconnect();
    } catch (err) {
        console.log("ResetSocket: " + err.message);
    }
}
function CloseSocket() {
    try {
        socketstatus = 0;
        if (socket)
            socket.close();
    } catch (err) {
        console.log("CloseSocket: " + err.message);
    }
}
function UpdateSocketStatus(port) {
    if (port) {
        sendTo(port, 'STATUS', { status: socketstatus ? 'OPEN' : 'CLOSED' });
    }
    else {
        broadcast('STATUS', { status: socketstatus ? 'OPEN' : 'CLOSED' });
    }
}
function SocketReconnect() {
    if (socketstatus === 1) {
        return false;
    } else {
        if (!socketRetry)
            socketRetry = setInterval(SetSocket, 5000);
    }
}

var pingTimer;
function SetPING() {
    pingTimer = setInterval(PING, 10 * 1000);
}
function ClearPING() {
    clearInterval(pingTimer);
}
function PING() {
    try {
        protocol.send('PING', 'webworker');
        console.log("PING!");
    } catch (err) {
        console.log("PING: " + err);
    }
}

function HandleMessage(message) {
    message = protocol.decode(message);

    if (message.messageType == 'BC') {
        if (message.messagePayload) {
            ParseBatch(message.messagePayload);
        }
    }
    else {
        message.eventType = 'RECEIVE';

        if (message.messageType in forcedMessageCache) {
            forcedMessageCache[message.messageType] = message;
        }

        let subs = union(subscriptions[message.messageType], subscriptions['*']);
        if (subs.size > 0) {
            for (const sub of subs) {
                if (typeof(sub) === 'function') {
                    sub(message);
                }
                else if ('postMessage' in sub) {
                    sub.postMessage(message);
                }
            }
        }
        else {
            console.log(`No subscribers for received message type: ${message.messageType}`);
            console.log(message.messagePayload);
        }
    }
}

// TODO: this should be part of the protocol object!!
function ParseBatch(data) {
    try {
        var d;
        if (data && data.constructor === Object) {
            d = data;
        } else {
            d = JSON.parse(data);
        }

        for (var key in d) {
            if (d.hasOwnProperty(key)) {
                let messagePayload = d[key];
                try {
                    messagePayload = JSON.parse(d[key]);
                }
                catch (_ex) {}

                HandleMessage({ messageType: key, messagePayload });
            }
        }
    } catch (err) {
        console.log("ParseBatch: " + err.toString());
    }
}


SetSocket();