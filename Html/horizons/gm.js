define(['hydra/net'], (HydraNet) => {

    const HorizonsGM = {
        TriggerEvent(eventId) {
            HydraNet.Send('EVENT', eventId);
        }
    }
    return HorizonsGM;
});