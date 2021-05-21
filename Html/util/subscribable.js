
class Subscribable {
    constructor(initialData) {
        this._data = Subscribable._deepClone(initialData);
        this.subscriptions = new Set();
    }

    peekData() {
        return this._data;
    }
    
    getData() {
        return Subscribable._deepClone(this._data);
    }

    hasData() {
        return !!this._data;
    }

    subscribe(callback) {
        if (callback && callback instanceof Function) {
            this.subscriptions.add(callback);
            if (this._data !== undefined) {
                setTimeout(() => { callback(this._data); }, 0);
            }
            const unsubscribe = () => this.subscriptions.delete(callback);
            return { unsubscribe };
        }
    }

    update(newData) {
        if (!Subscribable._deepEquals(this._data, newData)) {
            this._data = Subscribable._deepClone(newData);
            for (const sub of this.subscriptions) {
                sub(this);
            }
            return true;
        }
        return false;
    }

    partialUpdate(updatedProperties) {
        let changed = false;
        for (const prop in updatedProperties) {
            if (!Subscribable._deepEquals(this._data[prop], updatedProperties[prop])) {
                changed = true;
                this._data[prop] = Subscribable._deepClone(updatedProperties[prop]);
            }
        }

        if (changed) {
            for (const sub of this.subscriptions) {
                sub(this);
            }
            return true;
        }
        return false;
    }
}

Subscribable._deepClone = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(x => Subscribable._deepClone(x));
    }
    else if (obj === null) {
        return null;
    }
    else if (typeof(obj) === 'object') {
        if (typeof(obj.clone) === 'function') {
            return obj.clone();
        }
        else if (obj.constructor === Object) {
            const copy = {};
            for (const key in obj) {
                copy[key] = Subscribable._deepClone(obj[key]);
            }
            return copy;
        }
        else {
            return obj;
        }
    }
    else {
        return obj;
    }
}

Subscribable._deepEquals = (obj, newObj) => {
    if (Array.isArray(obj) && Array.isArray(newObj)) {
        if (obj.length !== newObj.length) {
            return false;
        }
        else {
            for (let i = 0; i < obj.length; ++i) {
                if (!Subscribable._deepEquals(obj[i], newObj[i])) {
                    return false;
                }
            }
        }
        return true;
    }
    else if (obj === null || newObj === null) {
        if (obj !== newObj) {
            return false;
        }
        return true;
    }
    else if (typeof(obj) === 'object' && typeof(newObj) === 'object') {
        if (typeof(obj.equals) === 'function') {
            return obj.equals(newObj);
        }
        else {
            const keys = Object.keys(obj);
            if (Subscribable._deepEquals(keys, Object.keys(newObj))) {
                for (const k of keys) {
                    if (!Subscribable._deepEquals(obj[k], newObj[k])) {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
            return true;
        }
    }
    else {
        return obj === newObj;
    }
}

define([], () => {
    return Subscribable;
});