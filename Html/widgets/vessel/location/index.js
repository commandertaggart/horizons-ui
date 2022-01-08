
import HorizonsWidget from "/widgets/horizons-widget.js";
import HzVessel from "/horizons/vessel.js";

const TAG = 'hz-vessel-location'

export default class HzVesselLocation extends HorizonsWidget {
    constructor() {
        super({
            template: '/widgets/vessel/location/template.html',
            styles: ['/widgets/vessel/location/style.css']
        });
    }
}

HorizonsWidget.register(TAG, HzVesselLocation,
    ['target']);