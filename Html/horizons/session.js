
define(['hydra/net', 'util/subscribableEvent', 'rxjs'], (HydraNet, SubscribableEvent, Rx) => {

    const sessionClearEvent = new SubscribableEvent();
    const sessionState = new Rx.BehaviorSubject('Idle');

    HydraNet.Subscribe('SESSION', (messageType, messagePayload) => {
        if (messagePayload.State !== sessionState.value) {
            sessionState.next(messagePayload.State);
        }
    });

    HzSession = {
        OnSessionClear = (callback) => {
            return sessionClearEvent.subscribe(callback);
        },

        sessionState,

        
    };

    return HzSession;
});