
class SubscribableEvent {
    constructor() {
        this.subscriptions = new Set();
    }

    subscribe(callback) {
        if (callback && callback instanceof Function) {
            this.subscriptions.add(callback);
            const unsubscribe = () => this.subscriptions.delete(callback);
            return { unsubscribe };
        }
    }

    trigger(... params) {
        for (const sub of this.subscriptions) {
            sub(... params);
        }
    }
}

define([], () => {
    return SubscribableEvent;
});