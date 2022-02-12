/*
    HzSession
    Owns session metagame data, settings and console state outside of gameplay.  Also relays top level game events.
*/
import HzSystem from '/horizons/system.js'
import HydraNet from '/hydra/net.js'

const ConsoleStatus = {
    IDLE: 'Idle',
    OFFLINE: 'Offline',
    ONLINE: 'Online',
    MISSION_BRIEFING: 'Mission Briefing',
    MISSION_SUMMARY: 'Mission Summary',
    BROKEN: 'Broken',
};

const ConsoleLevel = {
    NOVICE: 'Novice',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
};

class HorizonsSession extends HzSystem {
    constructor() {
        super();

        this._property('CommOverride', 'SESSION');
        this._property('EncountersEnabled', 'SESSION');
        this._property('Mode', 'SESSION');
        this._property('State', 'SESSION');

        this._property('Production', 'SETTINGS', { send: false });
        this._property('Debug', 'SETTINGS');

        this._property('ServerStartTime', 'SVRS', { send: false, packetHandler: (t) => new Date(t) });
        this._property('ServerScreen', 'SCREEN', { send: false });
        
        this._property('ConsoleLevel', 'CONSOLE-LEVEL');
        this._property('ConsoleStatus', 'CONSOLE-STATUS', { receive: false, defaultValue: ConsoleStatus.IDLE });

        this._property('Roles', 'ROLES', { defaultValue: {}, packetHandler: (msg) => msg });

        this._property('ConnectionStatus', 'NONE', { send: false, receive: false, setter: true, defaultValue: false });
        HydraNet.OnStatus(status => this.ConnectionStatus = !!status);

        this._event('Reset', 'RST');
        this._event('Break', 'CONSOLE-BREAK');

        this.addEventListener('Reset', () => {
            this.ConsoleStatus = ConsoleStatus.IDLE;
        });
        this.addEventListener('Break', () => {
            this.ConsoleStatus = ConsoleStatus.BROKEN;
        });
    }
}

HorizonsSession.ConsoleStatus = ConsoleStatus;
HorizonsSession.ConsoleLevel = ConsoleLevel;

const HzSession = new HorizonsSession();
export default HzSession;
