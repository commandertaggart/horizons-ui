
define(['hydra/net', 'horizons/vessel'], 
(HydraNet, HzVessel) => {
    let _factionData = null;
    let _vesselFaction = null;

    HydraNet.Subscribe('FACTIONS', (_messageType, messagePayload) => {
        _factionData = messagePayload;

        HzVessel.GetVessel().then((vessel) => {
            _vesselFaction = _factionData[vessel.Faction];
        });
    });


    const HzFactions = {
        ByID(id) {
            if (!id) {
                return undefined;
            }
            return _factionData[id].getData();
        },

        PlayerRelationWith(id) {
            if (!id) {
                return undefined;
            }
            if (_vesselFaction) {
                if (_vesselFaction.id === id) {
                    return 1;
                }
                return _vesselFaction.Relations[id];
            }
            return undefined;
        },

        FactionColor(id) {
            const faction = HzFactions.ByID(id);
            if (faction) {
                const c = faction.Color;
                return `#${c.R.toString(16).padStart(2,'0')}${c.G.toString(16).padStart(2,'0')}${c.B.toString(16).padStart(2,'0')}`;
            }
            return '#ffffff';
        },

        RelationColor(id) {
            const relation = HzFactions.PlayerRelationWith(id);
            if (relation !== undefined) {
                if (relation >= 0.8) {
                    return '#00ff00';
                }
                else if (relation >= 0.25) {
                    return '#00ffff';
                }
                else if (relation > -0.25) {
                    return '#ffffff';
                }
                else if (relation > -0.8) {
                    return '#ffff00';
                }
                else {
                    return '#ff0000';
                }
            }
            return '#ffffff';
        },

        RelationName(id) {
            const relation = HzFactions.PlayerRelationWith(id);
            if (relation !== undefined) {
                if (relation >= 0.8) {
                    return 'allied';
                }
                else if (relation >= 0.25) {
                    return 'friendly';
                }
                else if (relation > -0.25) {
                    return 'neutral';
                }
                else if (relation > -0.8) {
                    return 'hostile';
                }
                else {
                    return 'at-war';
                }
            }
            return 'unknown';
        }
    };

    return HzFactions;
});