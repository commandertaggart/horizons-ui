/*
    HzTest
    Provides data like other sources but for testing.
*/
import HzSystem from '/horizons/system.js';

class HorizonsTest extends HzSystem {
    constructor() {
        super();

        this._property('testBool', 'TEST', { send: false, receive: false, setter: true, defaultValue: false });
        this._property('testNumber', 'TEST', { send: false, receive: false, setter: true, defaultValue: 0 });
        this._property('testString', 'TEST', { send: false, receive: false, setter: true, defaultValue: 'text' });
    }
}

const HzTest = new HorizonsTest();
export default HzTest;
