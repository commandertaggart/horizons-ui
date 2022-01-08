
import HorizonsWidget from "/widgets/horizons-widget.js";
import HzVessel from "/horizons/vessel.js";

const TAG = 'hz-vessel-rotation'

export default class HzVesselRotation extends HorizonsWidget {
    constructor() {
        super({
            template: '/widgets/vessel/rotation/template.html',
            styles: ['/widgets/vessel/rotation/style.css']
        });

        this.__target = null;
        this.__callback = null;
        HzVessel.addEventListener('Orientation', 
            ({ value }) => value ? this.updateState(value) : null);
    }

    init() { 
        this.addEventListener('target', (newTarget) => {
            if (this.__callback) {
                this.__target.removeEventListener('Orientation', this.__callback);
                this.__callback = null;
                this.__target = null;
            }
            if (newTarget === '$vessel') {
                this.__target = HzVessel;
                this.__callback = (value) => value ? this.updateState(value) : null;
                this.__target.addEventListener('Orientation', this.__callback);
            }
        });
    }

}

HorizonsWidget.register(TAG, HzVesselRotation, 
    [ 'target' ]);