//import { useEffect } from 'preact/hooks';
import HydraNet from '/hydra/net.js'
import EventTarget from '/util/eventtarget.js'

const PROPS = Symbol('HzSystem.properties');

export default class HzSystem extends EventTarget {
    constructor() {
        super();

        this[PROPS] = {};
    }

    addEventListener(type, callback) {
        if (type in this[PROPS]) {
            const prop = this[PROPS][type];
            if (prop.packetName && !prop.subscription) {
                prop.subscription = HydraNet.Subscribe(prop.packetName, (_messageType, messagePayload) => {
                    if (prop.packetHandler) {
                        prop.value = prop.packetHandler(messagePayload);
                    }
                    else if (typeof(messagePayload) === 'object' && type in messagePayload) {
                        prop.value = messagePayload[type];
                    }
                    else {
                        prop.value = messagePayload;
                    }

                    this.dispatchEvent({
                        type,
                        target: this,
                        property: type,
                        value: prop.value
                    });
                });
            }
            else {
                callback({
                    type,
                    target: this,
                    property: type,
                    value: prop.value
                });
            }
        }
        super.addEventListener(type, callback);
    }

    removeEventListener(type, callback) {
        super.removeEventListener(type, callback);
        if (!this[EventTarget.LISTENERS][type]) {
            const prop = this[PROPS][type];
            if (prop && prop.subscription) {
                prop.subscription.then(sub => sub.unsubscribe());
                prop.subscription = null;
            }
        }
    }

    /*
    useProperty(property, callback, deps) {
        const cb = ({value}) => callback(value);
        return useEffect(() => {
            this.addEventListener(property, cb)
            return () => this.removeEventListener(property, cb);
        }, deps);
    }
    */

    _property(name, packetName, 
        { packetHandler, setter, defaultValue, receive = true, send = true } = {}) {

        this[PROPS][name] = {
            name,
            packetName: receive && packetName,
            packetHandler,
            setter,
            value: undefined,
            subscription: null
        };

        const descriptor = {
            get: () => this[PROPS][name].value
        }
        if (send || setter) {
            descriptor.set = (newValue) => {
                const prop = this[PROPS][name];
                prop.value = newValue;
                if (typeof(setter) === 'function') {
                    prop.setter(newValue);
                }
                if (send) {
                    HydraNet.Send(typeof(send) === 'string' ? send : packetName, newValue)
                }
            }
        }

        Object.defineProperty(this, name, descriptor);

        if (defaultValue !== undefined) {
            this[name] = defaultValue;
        }
    }

    _event(name, packetName) {
        this[PROPS][name] = {
            name,
            packetName,
            packetHandler: undefined,
            setter: undefined,
            value: undefined,
            subscription: null
        }
    }
}
