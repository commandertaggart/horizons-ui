
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
};

const HydraNet = {
    worker: null,
    packetSubscriptions: {},
    statusSubscriptions: new Set(),
    connectionStatus: 'CLOSED',
    _sendEvent: () => {},
    _isReady: new Deferred(),

    async Ready() {
        return this._isReady.promise;
    },

    async Connect(clientName, protocolVersion = window.HydraVersion, clientType = HydraNet.ClientType.SHARED_WORKER, devSubscribeAll = false) {
        if (clientType == HydraNet.ClientType.INLINE) {
            if (!this.worker) {
                const { default: HydraClient } = await import('/hydra/client.js');
                this.worker = new HydraClient(clientName, '25', devSubscribeAll);
                const port = {
                    postMessage: (event) => {
                        if (event) {
                            this.Receive(event);
                        }
                    }
                };

                this.worker.start().then(() => {
                    this._sendEvent = (eventType, messageType, messagePayload) => {
                        this.worker.onMessage(port, { data: { 
                            eventType,
                            messageType,
                            messagePayload
                        }});
                    };

                    this._sendEvent('START');

                    const statusSub = this.OnStatus((status) => {
                        if (status === 'OPEN') {
                            statusSub.unsubscribe();
                            this._isReady.resolve();
                        }
                    });
                });
            }
        }
        else if (clientType == HydraNet.ClientType.WORKER) {
            if (!this.worker) {
                this.worker = new window.Worker(`/hydra/worker.js?version=${protocolVersion}&clientName=${clientName}`);
            }

            this.worker.onmessage = (event) => {
                if (event && event.data) {
                    this.Receive(event.data);
                }
            }

            this._sendEvent = (eventType, messageType, messagePayload) => {
                this.worker.postMessage({
                    eventType,
                    messageType,
                    messagePayload
                });
            };

            this._sendEvent('START');
            this._isReady.resolve();
        }

        else if (clientType === HydraNet.ClientType.SHARED_WORKER) {
            if (!this.worker) {
                this.worker = new window.SharedWorker(`${MOD}/hydra/shared-worker.js?version=${protocolVersion}`);
            }

            this.worker.port.onmessage = (event) => {
                if (event && event.data) {
                    this.Receive(event.data);
                }
            }

            this._sendEvent = (eventType, messageType, messagePayload) => {
                this.worker.port.postMessage({
                    eventType,
                    messageType,
                    messagePayload
                });
            }

            this._sendEvent('START');
            this._isReady.resolve();
        }
        return this._isReady.promise;
    },

    Disconnect() {
        this._sendEvent('END');
        this._sendEvent = () => {};
        this.worker = null;
    },

    async Subscribe(messageType, callback) {
        await this.Ready();
        if (typeof(callback) === 'function') {
            const subSet = this.packetSubscriptions[messageType] = this.packetSubscriptions[messageType] || new Set();
            subSet.add(callback);

            this._sendEvent('SUBSCRIBE', messageType);

            const unsubscribe = () => { 
                subSet.delete(callback);
                this._sendEvent('UNSUBSCRIBE', messageType);
            };
            return { unsubscribe };
        }
    },

    async Send(messageType, messagePayload) {
        await this.Ready();
        this._sendEvent('SEND', messageType, messagePayload);
    },

    Receive(message) {
        if (message) {
            switch (message.eventType) {
                case 'RECEIVE': {
                    // console.log(`RECV: ${message.messageType}`);
                    let subs = this.packetSubscriptions[message.messageType];
                    if (subs) {
                        for (const sub of subs) {
                            sub(message.messageType, message.messagePayload);
                        }
                    }
                    subs = this.packetSubscriptions['*'];
                    if (subs) {
                        for (const sub of subs) {
                            sub(message.messageType, message.messagePayload);
                        }
                    }
                }
                break;

                case 'STATUS': {
                    if (message.status !== this.connectionStatus) {
                        this.connectionStatus = message.status;
                        for (const sub of this.statusSubscriptions) {
                            sub(this.connectionStatus);
                        }
                    }
                }
                break;

                case 'LOG': {
                    console.log(message.message);
                }
                break;

                default:
                    console.warn('Received unexpected event type:', message.eventType);
                    console.info(message);
                break;
            }
        }
    },

    OnStatus(callback) {
        if (typeof(callback) === 'function') {
            this.statusSubscriptions.add(callback);
            
            const unsubscribe = () => { this.statusSubscriptions.delete(callback); };
            setTimeout(() => callback(this.connectionStatus), 0);
            return { unsubscribe };
        }
    }
};

HydraNet.ClientType = {
    INLINE: 'inline',
    WORKER: 'worker',
    SHARED_WORKER: 'sharedWorker'
};

export default HydraNet;