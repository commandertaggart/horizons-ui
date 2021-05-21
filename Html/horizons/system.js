define(['hydra/net', 'util/subscribable', 'horizons/gameObject'], (HydraNet, Subscribable, GameObject) => {

    const _systemData = new Subscribable();
    // const _planets = [];

    HydraNet.Subscribe('LOCATION-CURRENT', (_messageType, messagePayload) => {
        if (_systemData.update(messagePayload)) {

        }
    });

    const HorizonsCurrentSystem = {
        OnSystemChange(callback) {
            return _systemData.subscribe(callback);
        },

        get systemData() { return _systemData.getData(); }
    };

    Horizons = Horizons || {};
    Horizons.Data = Horizons.Data || {};
    Horizons.Data.CurrentSystem = HorizonsCurrentSystem;
    return HorizonsCurrentSystem;
});