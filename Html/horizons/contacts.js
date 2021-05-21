define([
    'hydra/net', 'horizons/gameObject', 'util/subscribableEvent', 'rxjs',
    // Load the contact base types so they're registered
    'horizons/gameObjects/Planet',
    'horizons/gameObjects/Vessel'
], (
    HydraNet, GameObject, SubscribableEvent, Rx
) => {

    window.GO_TYPES = {};
    window.SUBTYPES = {};

    const EVENT = {
        ADD: 'ADD',
        UPDATE: 'UPDATE',
        TARGETED: 'TARGETED',
        SCANNING: 'SCANNING',
        REMOVE: 'REMOVE'
    };

    const _contactData = {};
    const _targetData = {
        'TARGET-FLIGHT': new Rx.BehaviorSubject(),
        'TARGET-TACTICAL': new Rx.BehaviorSubject(),
        'TARGET-SCIENCE': new Rx.BehaviorSubject()
    };
    const _contactWatchers = new SubscribableEvent();
    const _blastEvent = new SubscribableEvent();

    HydraNet.Subscribe('CONTACTS', HandleContacts);
    HydraNet.Subscribe('CONTACT-UPDATE', HandleContacts);
    HydraNet.Subscribe('CONTACTS-CLEAR', RemoveContacts);
    HydraNet.Subscribe('CONTACT-REMOVE', RemoveContacts);
    HydraNet.Subscribe('OBJECT-REMOVE', RemoveContacts);

    HydraNet.Subscribe('BLAST', (_messageType, messagePayload) => {
        _blastEvent.trigger(messagePayload);
    });

    HydraNet.Subscribe('TARGET-FLIGHT', HandleTarget);
    HydraNet.Subscribe('TARGET-TACTICAL', HandleTarget);
    HydraNet.Subscribe('TARGET-SCIENCE', HandleTarget);

    function HandleContacts(messageType, contacts) {
        if (messageType == 'CONTACT-UPDATE') {
            contacts = [contacts];
        }

        for (const contact of contacts) {
            const ID = contact.ID || contact.Name;
            const TYPE = (window.GO_TYPES[contact.BaseType] = window.GO_TYPES[contact.BaseType] || new Set());
            const SUB = (window.SUBTYPES[contact.BaseType] = window.SUBTYPES[contact.BaseType] || new Set());
            for (const k in contact) { TYPE.add(k); }
            SUB.add(contact.SubType);

            if (ID in _contactData) {
                let contactObj = _contactData[ID];
                if ('BaseType' in contact && contact.BaseType !== contactObj.BaseType) {
                    RemoveContacts('CONTACT-REMOVE', ID);
                }
                else if (contactObj.partialUpdate(contact)) {
                    _contactWatchers.trigger(EVENT.UPDATE, contactObj);
                }
            }
            if (!(ID in _contactData)) {
                _contactData[ID] = GameObject.Create(contact);
                _contactWatchers.trigger(EVENT.ADD, _contactData[ID]);
            }
        }
    }

    function RemoveContacts(messageType, contacts) {
        if (messageType === 'CONTACTS-CLEAR') {
            contacts = Object.keys(_contactData);
        }
        else if (messageType === 'CONTACT-REMOVE' || messageType === 'OBJECT-REMOVE') {
            contacts = [contacts];
        }

        for (const contact of contacts) {
            if (contact in _contactData) {
                _contactData[contact].destroy();
                delete _contactData[contact];
                _contactWatchers.trigger(EVENT.REMOVE, contact);
            }
            for (const targetType in _targetData) {
                const target = _targetData[targetType].value;
                if (target && contact === target.ID) {
                    setTimeout(((id) => {
                        _targetData[targetType].next(GameObject.ForID(id))
                    }).bind(contact), 0);
                }
            }
        }
    }

    function HandleTarget(messageType, targetId) {
        _targetData[messageType].next(GameObject.ForID(targetId));
    }

    const HorizonsContacts = {
        OnContactEvent(id, callback) {
            if (id instanceof Function) {
                callback = id;
                id = undefined;
            }
            let sub = null;
            const fn = (contactEvent, contact) => {
                if (typeof(id) === 'undefined' || id === contact.ID) {
                    callback(contactEvent, contact);

                    if (contactEvent === EVENT.REMOVE) {
                        sub.unsubscribe();
                    }
                }
            }
            return sub = _contactWatchers.subscribe(fn);
        },

        OnBlastEvent(callback) {
            return _blastEvent.subscribe(callback);
        },

        OnTargetUpdate(targetType, callback) {
            return _targetData[{
                'flight': 'TARGET-FLIGHT',
                'tactical': 'TARGET-TACTICAL',
                'science': 'TARGET-SCIENCE'
            }[targetType]].subscribe(callback);
        },

        Event: EVENT
    }
    return HorizonsContacts;
});