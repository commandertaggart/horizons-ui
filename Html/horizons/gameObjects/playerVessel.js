
define(['horizons/gameObjects/vessel'], (Vessel) => {
    
    class PlayerVessel extends Vessel {
        constructor(initialData) {
            super(initialData);
        }
    }

    return PlayerVessel;
})