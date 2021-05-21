
define(['three'], (THREE) => {
    class HorizonsWidget extends HTMLElement {
        constructor() {
            super();
        }
        
        boolValue(val, def) {
            if (def) {
                return !(val === 'false' || val === 'no' || val === 'off');
            }
            else {
                return (val === 'true' || val === 'yes' || val === 'on');
            }
        }

        getBoolAttribute(attrName, def) {
            const val = this.getAttribute(attrName).toLowerCase();
            return this.boolValue(val, def);
        }

        numValue(val, def) {
            if (val === null  || isNaN(val)) {
                return def;
            }
            else {
                return +val;
            }
        }

        getNumAttribute(attrName, def) {
            const val = this.getAttribute(attrName);
            return this.numValue(val, def);
        }

        vectorValue(val) {
            if (val.startsWith('(') && val.endsWith(')')) {
                const parts = val.substring(1, val.length-1).split(',').map(p => p.trim());
                return new THREE.Vector3(parts[0] || 0, parts[1] || 0, parts[2] || 0);
            }
            return null;
        }

        getVectorAttribute(attrName, def) {
            const val = this.getAttribute(attrName);
            return this.vectorValue(val, def);
        }
    }

    return HorizonsWidget;
})