
const ALWAYS_MESSAGES = [
    //'VESSEL', 'FACTIONS', 'ALERT'
];

function union(setA, setB) {
    setA = new Set(setA || []);
    setB = (setB && setB[Symbol.iterator]) ? setB : [];
    for (const x of setB) {
        setA.add(x);
    }
    return setA;
}

export default class HydraClient{
    constructor(clientName = 'Taggart', protocolVersion = '25', devSubscribeAll = false) {
        this._clientName = clientName;

        this.protocolVersion = protocolVersion;
        this.protocol = null;

        this.socket = null;
        this.socketstatus = 0;
        this.socketRetry = null;
        this.pingTimer = null;

        this.ports = new Map();
        this.subscriptions = {};
        this.desiredMessages = new Set(ALWAYS_MESSAGES);
        
        this.lastMessageCache = {};
        ALWAYS_MESSAGES.forEach(m => this.lastMessageCache[m] = null);

        this.__devSubscribeAll = devSubscribeAll;
    }

    async start() {
        const { default: protocol } = await import(`./protocol/${this.protocolVersion}.js`)
        this.protocol = protocol;
        this.setSocket();
    }

    get clientName() {
        return this._clientName;
    }

    subscribe(port, messageType) {
        const subs = this.subscriptions[messageType] = this.subscriptions[messageType] || new Set();
        subs.add(port);

        if (messageType !== '*') {
            if (!this.desiredMessages.has(messageType)) {
                this.desiredMessages.add(messageType);
                if (this.socketstatus === 1 && !this.__devSubscribeAll) {
                    this.protocol.send(this.socket, 'ACCEPT-PACKET', messageType);
                }
            }

            if (messageType in this.lastMessageCache && this.lastMessageCache[messageType]) {
                this.sendToPort(port, 'RECEIVE', this.lastMessageCache[messageType]);
            }
        }
    }

    unsubscribe(port, messageType) {
        if (this.subscriptions[messageType]) {
            this.subscriptions[messageType].delete(port);
            if (this.subscriptions[messageType].size === 0) {
                this.desiredMessages.delete(messageType);
                if (this.socketstatus === 1 && !this.__devSubscribeAll) {
                    this.protocol.send(this.socket, 'REJECT-PACKET', messageType);
                }
            }
        }
    }

    addPort(port) {
        if (!this.ports.has(port)) {
            this.ports.set(port, {
                port,
            });
        }

        this.updateSocketStatus(port);
    }

    removePort(port) {
        this.ports.delete(port);
        for (const msgType in subscriptions) {
            unsubscribe(msgType, port);
        }
        if (this.ports.size === 0) {
            CloseSocket();
        }
    }

    sendToPort(port, eventType, data) {
        port.postMessage({
            eventType,
            ... data
        });
    }
    
    broadcast(eventType, data) {
        for (const [port, _portData] of this.ports) {
            this.sendToPort(port, eventType, data);
        };
    }
    
    onMessage(port, event) {

        if (event && event.data && event.data.eventType) {
            switch (event.data.eventType) {
                case 'START': {
                    this.addPort(port);
                }
                break;
                case 'STOP': {
                    this.removePort(port);
                }
                break;
                case 'SUBSCRIBE': {
                    this.subscribe(port, event.data.messageType);
                }
                break;
                case 'UNSUBSCRIBE': {
                    this.unsubscribe(port, event.data.messageType);
                }
                break;
                case 'SEND': {
                    if (this.ports.has(port) && event.data.messageType && event.data.messagePayload) {
                        this.protocol.send(this.socket, event.data);
                    }
                }
            }
        }
    }

    setSocket() {
        var thishost = location.hostname;

        try {
            if (this.socket) 
                this.closeSocket();
        } catch (err) {
            console.log("[setSocket] error closing socket: " + err.message);
        }
    
        try {
            const self = this;
            this.socket = new WebSocket('ws://' + thishost + ':' + this.protocol.port + '/');
            this.socket.onopen = function (event) {
                try {
                    self.setPING();
                    clearInterval(self.socketRetry);
                    self.socketRetry = null;
                    self.socketstatus = 1;
                    self.updateSocketStatus();
                    if (self.__devSubscribeAll) {
                        self.protocol.send(self.socket, 'ACCEPT-PACKET', '*');
                    }
                    else {
                        self.desiredMessages.forEach((messageType) => {
                            if (messageType !== '*') {
                                self.protocol.send(self.socket, 'ACCEPT-PACKET', messageType);
                            }
                        });
                    }
                    self.protocol.send(self.socket, 'IDENTIFY', JSON.stringify({
                        ScreenName: self.clientName,
                        Location: ''
                    }));
                } catch (err) {
                    console.log("Socket.OnOpen: " + err);
                }
            };
            this.socket.onclose = function (event) {
                self.clearPING();
                self.resetSocket();
            };
            this.socket.onerror = function (event) {
                self.closeSocket();
            };
            this.socket.onmessage = function (event) {
                // console.log(event);
                try {
                    self.handleMessage(event.data);
                } catch (err) {
                    console.log("Socket.OnMessge: " + err.message);
                }
                
            };
        } catch (err) {
            console.log("SetSocket: " + err.message);
            this.socketstatus = 0;
        }       
    }

    resetSocket() {
        try {
            this.closeSocket();
            this.updateSocketStatus();
            this.socketReconnect();
        } catch (err) {
            console.log("ResetSocket: " + err.message);
        }        
    }

    closeSocket() {
        try {
            this.socketstatus = 0;
            if (this.socket) {
                this.socket.close();
            }
        } catch (err) {
            console.log("CloseSocket: " + err.message);
        }
    }

    updateSocketStatus(port) {
        if (port) {
            this.sendToPort(port, 'STATUS', { status: this.socketstatus ? 'OPEN' : 'CLOSED' });
        }
        else {
            this.broadcast('STATUS', { status: this.socketstatus ? 'OPEN' : 'CLOSED' });
        }
    }

    socketReconnect() {
        if (this.socketstatus === 1) {
            return false;
        }
        else {
            if (!this.socketRetry) {
                this.socketRetry = setInterval(SetSocket, 5000);
            }
        }
    }
    
    setPING() {
        if (!this.pingTimer) {
            const PING = () => {
                try {
                    this.protocol.send(this.socket, 'PING', this.clientName);
                    console.log("PING!");
                } catch (err) {
                    console.log("PING: " + err);
                }
            }

            this.pingTimer = setInterval(PING, 10 * 1000);
        }
    }

    clearPING() {
        clearInterval(this.pingTimer);
        this.pingTimer = null;
    }

    
    handleMessage(message) {
        message = this.protocol.decode(message);
    
        if (message.messageType == 'BC') {
            if (message.messagePayload) {
                this.parseBatch(message.messagePayload);
            }
        }
        else {
            this.lastMessageCache[message.messageType] = message;
            if (this.desiredMessages.has(message.messageType)) {
        
                let subs = union(this.subscriptions[message.messageType], this.subscriptions['*']);
                if (subs.size > 0) {
                    for (const sub of subs) {
                        this.sendToPort(sub, 'RECEIVE', message);
                    }
                }
                else {
                    console.log(`No subscribers for received message type: ${message.messageType}`);
                    console.log(message.messagePayload);
                }
            }
        }
    }
    
    // TODO: this should be part of the protocol object!!
    parseBatch(data) {
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
    
                    this.handleMessage({ messageType: key, messagePayload });
                }
            }
        } catch (err) {
            console.log("ParseBatch: " + err.toString());
        }
    }
}

