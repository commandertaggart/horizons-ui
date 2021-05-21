define(['hydra/net', 'util/subscribable', 'horizons/gameObjects/playerVessel'], (HydraNet, Subscribable, PlayerVessel) => {

    const ALERT_COLORS = [
        'gray',
        'blue',
        'green',
        'yellow',
        'red'
    ];

    let _vesselData = null;
    let _vesselFaction = new Subscribable();
    let _alertStatus = new Subscribable(ALERT_COLORS[1]);
    let _rolesStatus = new Subscribable([]);

    window.VESSEL_TYPE = new Set();

    const _vesselPromise = new Promise((resolve, _reject) => {
        HydraNet.Subscribe('VESSEL', (_messageType, messagePayload) => {
            for (const k  in messagePayload) { window.VESSEL_TYPE.add(k); }

            if (!_vesselData) {
                _vesselData = new PlayerVessel(messagePayload);
                resolve(_vesselData);
            }
            else {
                _vesselData.partialUpdate(messagePayload);
            }
            if (messagePayload.Faction) {
                _vesselFaction.update(messagePayload.Faction);
            }
        });
    });

    HydraNet.Subscribe('ALERT', (_messageType, messagePayload) => {
        _alertStatus.update(ALERT_COLORS[messagePayload]);
    });

    HydraNet.Subscribe('ROLES', (_messageType, messagePayload) => {
        _rolesStatus.update(messagePayload);
    });

    const HorizonsVessel = {
        OnVesselUpdate(callback) {
            return _vesselData.subscribe(callback);
        },

        OnFactionUpdate(callback) {
            return _vesselFaction.subscribe(callback);
        },

        OnAlertStatusUpdate(callback) {
            return _alertStatus.subscribe(callback);
        },

        OnRolesStatusUpdate(callback) {
            return _rolesStatus.subscribe(callback);
        },

        GetVesselID() {
            return new Promise((resolve, _reject) => {
                const sub = HorizonsVessel.OnVesselUpdate((vessel) => {
                    if (vessel && vessel.ID) {
                        sub.unsubscribe();
                        resolve(vessel.ID);
                    }
                });
            });
        },

        GetVessel() {
            return _vesselPromise;
        },

        get vesselData() { return _vesselData.getData(); },
        get alertStatus() { return _alertStatus.getData(); },
        get rolesStatus() { return _rolesStatus.getData(); }
    }

    if (typeof(Horizons) === 'undefined') Horizons = {};
    Horizons.Data = Horizons.Data || {};
    Horizons.Data.Vessel = HorizonsVessel;
    return HorizonsVessel;
});