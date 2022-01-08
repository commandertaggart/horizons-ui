
import HzSystem from '/horizons/system.js';

class HorizonsGalaxy extends HzSystem {
    constructor() {
        super();

        this._property('Galaxy', 'GSP');
        this._property('System', 'GSP');
        this._property('Planet', 'GSP');
    }
}

const HzGalaxy = new HorizonsGalaxy();
export default HzGalaxy; 

// MAP, FACTIONS