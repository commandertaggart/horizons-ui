
const LISTENERS = Symbol('EventTarget.listeners');

export default class EventTarget {
    constructor() {
        this[LISTENERS] = {};
    }

    addEventListener(type, callback) {
        if (typeof(callback) === 'function' && typeof(type) === 'string' && type) {
            this[LISTENERS][type] = (this[LISTENERS][type] || []);
            this[LISTENERS][type].push(callback);
        }
    }

    removeEventListener(type, callback) {
        if (this[LISTENERS][type]) {
            this[LISTENERS][type] = this[LISTENERS][type].filter(l => l !== callback);

            if (this[LISTENERS][type].length === 0) {
                delete this[LISTENERS][type];
            }
        }
    }

    dispatchEvent(event) {
        const listeners = this[LISTENERS][event.type] || [];

        for (const listener of listeners) {
            listener(event);
        }
    }
}

EventTarget.LISTENERS = LISTENERS;
