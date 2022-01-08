
import HorizonsWidget from "/widgets/horizons-widget.js";
import HzVessel from "/horizons/vessel.js";

const TAG = 'hz-vessel-heading'

export default class HzVesselHeading extends HorizonsWidget {
    constructor() {
        super({
            template: '/widgets/vessel/heading/template.html',
            styles: ['/widgets/vessel/heading/style.css']
        });

        this.__headingTarget = null;
        this.__headingCallback = null;
        HzVessel.addEventListener('Orientation',
            ({ value }) => this.updateState('heading', this.__headingFromOrientation(value)));
    }

    init() {
        this.addEventListener('target', (newTarget) => {
            if (this.__headingCallback) {
                this.__headingTarget.removeEventListener('Orientation', this.__headingCallback);
                this.__headingCallback = null;
                this.__headingTarget = null;
            }
            if (newTarget === '$vessel') {
                this.__headingTarget = HzVessel;
                this.__headingCallback = (value) =>
                    this.updateState('heading', this.__headingFromOrientation(value));
                this.__headingTarget.addEventListener('Orientation', this.__headingCallback);
            }
        });
    }

    __headingFromOrientation(o) {
        //Heading from Pitch/Yaw/Roll
        if (typeof o === 'undefined') return "000 + 00";

        var hdg = 0;
        var p = 0;
        var p2 = 0;
        var sign = "-";
        hdg = Math.abs(o.Yaw).toFixed(0);
        p = o.Pitch;

        p2 = Math.abs(p).toFixed(0);

        if (p2 > 270) {
            // Pitch Down
            p2 = 90 - p2 % 270;
            sign = "-";
        } else if (p2 > 180) {
            p2 = 90 - p2 % 180;
            sign = "-";
        } else if (p2 > 90) {
            p2 = 90 - p2 % 90;
            sign = "+";
        } else if (p2 > 0) {
            sign = "+";
        } else {
            sign = "-";
        }

        return `${hdg.toString().padStart(3, '0')} ${sign} ${p2.toString().padStart(2, '0')}`;
    }
}

HorizonsWidget.register(TAG, HzVesselHeading,
    ['target']);