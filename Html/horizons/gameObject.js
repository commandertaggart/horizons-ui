
define(['util/subscribable', 'util/subscribableEvent', 'three'], (Subscribable, SubscribableEvent, THREE) => {
    const DEG_TO_RAD = 2 * Math.PI / 360;

    const _gameObjects = new Map();
    const _objectCreatedEvent = new SubscribableEvent();
    const _objectDestroyedEvent = new SubscribableEvent();

    const _classTypes = {};

    class GameObject extends Subscribable {
        constructor(data) {
            super();

            this._objectDestroyedEvent = new SubscribableEvent();
            this._objectTypeChangedEvent = new SubscribableEvent();

            this._id = data.ID || data.Name;
            GameObject.SetForID(this._id, this);
            this.update(data);
            _objectCreatedEvent.trigger(this);
        }

        _instrumentData(data) {
            if ('Position' in data) {
                // data.Position = new Vector(data.Position);
                // fix the position because the server swaps Y and Z for 2D convenience.
                data.Position = new THREE.Vector3(
                    data.Position.X,
                    data.Position.Z, // !!
                    data.Position.Y  // !!
                );
            }
            if ('Orientation' in data) {
                data.Orientation = new THREE.Euler(
                    data.Orientation.Y * DEG_TO_RAD,
                    -data.Orientation.X * DEG_TO_RAD,
                    -data.Orientation.Z * DEG_TO_RAD,
                    'YXZ'
                );
            }
        }
        
        update(data) {
            const oldType = this._data ? this.BaseType : '';
            this._instrumentData(data); 
            data.BaseType = data.BaseType || 'Object';
            super.update(data);
            if (oldType !== this.BaseType) {
                this._objectTypeChangedEvent.trigger(oldType, this.BaseType);
            }
        }

        partialUpdate(data) {
            const oldType = this.BaseType;
            this._instrumentData(data);
            super.partialUpdate(data);
            if (oldType !== this.BaseType) {
                this._objectTypeChangedEvent.trigger(oldType, this.BaseType);
            }
        }

        destroy() {
            GameObject.DeleteForID(this._id);
            this._objectDestroyedEvent.trigger();
            _objectDestroyedEvent.trigger(this);
        }

        OnDestroy(callback) {
            return this._objectDestroyedEvent.subscribe(callback);
        }

        OnTypeChange(callback) {
            return this._objectTypeChangedEvent.subscribe(callback);
        }

        get ID() { return this._data.ID; }
        get BaseType() { return this._data.BaseType; }
        get Position() { return this._data.Position; }
        get Orientation() { return this._data.Orientation; }
        get Faction() { return this._data.Faction; }
    }

    GameObject.OnObjectAdded = (callback) => {
        return _objectCreatedEvent.subscribe(callback);
    }

    GameObject.OnObjectDeleted = (callback) => {
        return _objectDestroyedEvent.subscribe(callback);
    }

    GameObject.ForID = (id) => {
        return _gameObjects.get(id);
    }

    GameObject.SetForID = (id, object) => {
        _gameObjects.set(id, object);
    }

    GameObject.DeleteForID = (id) => {
        _gameObjects.delete(id);
    }

    GameObject.InRange2 = (center, range2) => {
        const results = [];

        _gameObjects.forEach((obj) => {
            const offset  = obj.Position.sub(center);
            if (offset.magnitude2 <= range2) {
                results.push(obj);
            }
        });

        return results;
    }

    GameObject.InRange = (center, range) => {
        return GameObject.InRange2(center, range * range);
    }

    GameObject.ForEach = (callback) => {
        _gameObjects.forEach((obj) => callback(obj));
    }

    GameObject.RegisterBaseType = (baseType, classType) => {
        if (baseType in _classTypes) {
            if (_classTypes[baseType] === classType) {
                console.warn(`Class constructor for base type "${baseType}" already registered.`);
            }
            else {
                console.error(`Multiple class constructors registered for base type "${baseType}".`);
            }
        }

        _classTypes[baseType] = classType;
    }
    GameObject.BaseTypeRegistered = (baseType) => {
        return baseType in _classTypes;
    }

    GameObject.Create = (data) => {
        if (data.BaseType in _classTypes) {
            return new _classTypes[data.BaseType](data);
        }
        else {
            return new GameObject(data);
        }
    }

    return GameObject;
})