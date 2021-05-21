define(['hydra/net', 'util/subscribable'], (HydraNet, Subscribable) => {

    const _galaxyMap = new Subscribable();

    HydraNet.Subscribe('MAP', (messageType, messagePayload) => {
        if (messageType === 'MAP') {
            _galaxyMap.update(messagePayload);
        }
    });

    const HorizonsGalaxy = {
        OnGalaxyMapUpdate(callback) {
            return _galaxyMap.subscribe(callback);
        },

        get galaxyMap() { return _galaxyMap.getData(); },

        RequestSystemDetail(name) {
            return new Promise((resolve, _reject) => {
                const sub = HydraNet.Subscribe('LOCATION-DETAIL', (messageType, messagePayload) => {
                    if (messageType === 'LOCATION-DETAIL' && messagePayload.Name === name) {
                        sub.unsubscribe();
                        resolve(messagePayload);
                    }
                });
                Send('LOCATION-DETAIL', name);
            });
        }
    };

    if (typeof(Horizons) === 'undefined') Horizons = {};
    Horizons.Data = Horizons.Data || {};
    Horizons.Data.Galaxy = HorizonsGalaxy;
    return HorizonsGalaxy;
});