
function defineHydraNet() {

    const HydraNet = {
        worker: null,
        packetSubscriptions: {},
        statusSubscriptions: new Set(),
        connectionStatus: 'CLOSED',

        Connect(protocolVersion = window.HydraVersion) {
            if (!this.worker) {
                this.worker = new window.SharedWorker(`${MOD}/hydra/worker.js?version=${protocolVersion}`);
                this.worker.port.onmessage = (event) => {
                    if (event && event.data) {
                        switch (event.data.eventType) {
                            case 'RECEIVE': {
                                // console.log(`RECV: ${event.data.messageType}`);
                                if (event.data.messageType in this.packetSubscriptions) {
                                    let subs = this.packetSubscriptions[event.data.messageType];
                                    for (const sub of subs) {
                                        sub(event.data.messageType, event.data.messagePayload);
                                    }
                                    subs = this.packetSubscriptions['*'];
                                    if (subs) {
                                        for (const sub of subs) {
                                            sub(event.data.messageType, event.data.messagePayload);
                                        }
                                    }
                                }
                            }
                            break;

                            case 'STATUS': {
                                if (event.data.status !== this.connectionStatus) {
                                    this.connectionStatus = event.data.status;
                                    for (const sub of this.statusSubscriptions) {
                                        sub(this.connectionStatus);
                                    }
                                }
                            }
                            break;

                            case 'LOG': {
                                console.log(event.data.message);
                            }
                            break;

                            default:
                                console.warn('Received unexpected event type:', event.data.eventType);
                                console.info(event.data);
                            break;
                        }
                    }
                };

                this.worker.port.postMessage({
                    eventType: 'START',
                    protocolVersion
                });
            }
        },

        Disconnect() {
            if (this.worker) {
                this.worker.port.postMessage({
                    eventType: 'END'
                });
            }
        },

        Subscribe(messageType, callback) {
            if (typeof(callback) === 'function' && this.worker) {
                const subSet = this.packetSubscriptions[messageType] = this.packetSubscriptions[messageType] || new Set();
                subSet.add(callback);

                this.worker.port.postMessage({
                    eventType: 'SUBSCRIBE',
                    messageType
                });

                const unsubscribe = () => { subSet.delete(callback); };
                return { unsubscribe };
            }
        },

        Send(messageType, messagePayload) {
            if (this.worker) {
                this.worker.port.postMessage({
                    eventType: 'SEND',
                    messageType,
                    messagePayload
                });
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

    if (window) {
        window.HydraNet = HydraNet;
    }

    return HydraNet;
};

if (window.define) {
    define([], defineHydraNet);
}
else {
    defineHydraNet();
}