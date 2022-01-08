
import HzSystem from "./system.js";

class HorizonsVessel extends HzSystem {
    constructor() {
        super();

        this._property('Position', 'VESSEL');
        this._property('Orientation', 'VESSEL', { 
            packetHandler: ({Orientation: o}) => ({ 
                Yaw: o.Yaw || o.X,
                Pitch: o.Pitch || o.Y,
                Roll: o.Roll || o.Z
            })
        });
    }
}

const HzVessel = new HorizonsVessel();
export default HzVessel;